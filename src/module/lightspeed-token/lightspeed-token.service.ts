import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";

type TokenRecord = {
    accessToken: string;
    refreshToken: string;
    expiresIn: Date;
    businessId?: string;
};

@Injectable()
export class LightspeedTokenService {
    private cache: TokenRecord | null = null;
    private refreshingPromise: Promise<string> | null = null;
    private readonly nodeEnv = process.env.NODE_ENV;
    private refreshTimer: NodeJS.Timeout | null = null;
    private isScheduledRefreshRunning = false;

    constructor(private readonly prisma: PrismaService) {}

    public async getAccessToken(): Promise<string> {
        //Check in-memory cache first
        if (this.cache && !this.isExpired(this.cache.expiresIn)) {
            return this.cache.accessToken;
        }

        // Load from database
        const record = await this.prisma.lightspeedToken.findUnique({
            where: { id: 1 },
        });

        if (!record) {
            throw new InternalServerErrorException(
                "Lightspeed Auth Token not found. Please authenticate first."
            );
        }

        // If expired → refresh immediately
        if (this.isExpired(record.expiresIn)) {
            return this.refreshToken(record);
        }

        //  Cache valid token
        this.cache = record;

        // Schedule refresh BEFORE expiry (safe delayed execution)
        this.scheduleRefresh(record.expiresIn);

        return record.accessToken;
    }

    // Token refesh system
    private async refreshToken(record: TokenRecord): Promise<string> {
        if (this.refreshingPromise) {
            return this.refreshingPromise;
        }

        this.refreshingPromise = this.performRefresh(record);

        try {
            return await this.refreshingPromise;
        } finally {
            this.refreshingPromise = null;
        }
    }

    // method --> hit to lightspeed refresh route
    private async performRefresh(record: TokenRecord): Promise<string> {
        console.log("Hit on perform refresh");
        try {
            const url =
                this.nodeEnv === "development"
                    ? "https://softwareartisans.retail.lightspeed.app/api/1.0/token"
                    : `${process.env.API_URL}/oauth/token`;

            const params = new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: record.refreshToken,
                client_id: process.env.CLIENT_ID!,
                client_secret: process.env.CLIENT_SECRET!,
            });

            const response = await axios.post(url, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const data = response.data;
            console.log("result of hit with axios : ", data);

            // calculate new expiry time
            const newExpiresIn = new Date(Date.now() + data.expires_in * 1000);

            // update DB with new token set
            const updated = await this.prisma.lightspeedToken.update({
                where: { id: 1 },
                data: {
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token ?? record.refreshToken,
                    expiresIn: newExpiresIn,
                },
            });

            // update memory cache
            this.cache = updated;

            // reschedule next refresh safely
            this.scheduleRefresh(updated.expiresIn);

            return updated.accessToken;
        } catch (error) {
            console.error(
                "❌ Token refresh failed:",
                error?.response?.data || error
            );

            throw new InternalServerErrorException(
                "Failed to refresh Lightspeed token"
            );
        }
    }

    // method --> schedule next refresh
    private scheduleRefresh(expiresAt: Date) {
        // clear previous timer (VERY IMPORTANT)
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        const now = Date.now();
        const expiry = new Date(expiresAt).getTime();

        // refresh 10 minutes before expiry
        const refreshAt = expiry - 10 * 60 * 1000;

        const delay = Math.max(refreshAt - now, 0);

        this.refreshTimer = setTimeout(async () => {
            return await this.executeScheduledRefresh();
        }, delay);

        console.log(this.refreshTimer);
        console.log(`⏳ Scheduling refresh in ${delay / 1000}s`);
    }

    // method --> scheduled refresh executor
    private async executeScheduledRefresh() {
        if (this.isScheduledRefreshRunning) return;

        this.isScheduledRefreshRunning = true;

        try {
            const record = await this.prisma.lightspeedToken.findUnique({
                where: { id: 1 },
            });

            if (!record) return;

            // If already valid → no need to refresh

            await this.refreshToken(record);
        } catch (err) {
            console.error("❌ Scheduled refresh failed:", err);
        } finally {
            this.isScheduledRefreshRunning = false;
        }
    }

    // utility methods

    private isExpired(expiresAt: Date): boolean {
        const buffer = 60 * 1000; // 1 minute safety buffer
        return new Date(expiresAt).getTime() - buffer <= Date.now();
    }
}
