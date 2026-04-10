import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";
import { isUUID } from "class-validator";

@Injectable()
export class LightspeedAuthService {
    constructor(
        // prisma
        private readonly prisma: PrismaService
    ) {}

    private readonly nodeEnv = process.env.NODE_ENV;

    // service --> get access token URI request
    public async getAccessURI() {
        // finding the restaurant

        const restaurant = await this.fetchRestaurent();

        const uri = `https://auth.lsk-demo.app/realms/k-series/protocol/openid-connect/auth?response_type=code&client_id=${restaurant.clientId}&redirect_uri=${process.env.SERVER_URL}/lightspeed-auth/callback&scope=orders-api%20reservation-${process.env.PLATFORM_CODE}&state=${restaurant.id}`;

        const devUri = `https://secure.vendhq.com/connect?response_type=code&client_id=${restaurant.clientId}&redirect_uri=${process.env.SERVER_URL}/lightspeed-auth/callback&state=${restaurant.id}`;

        return {
            uri: this.nodeEnv === "development" ? devUri : uri,
        };
    }

    // service --> get access token with callback
    public async lightSpeedCallback(query: any) {
        if (!query.code || query.code.length < 1 || !isUUID(query.state)) {
            throw new BadRequestException(
                "Invalid auth code or restaurant id (state)"
            );
        }

        const restaurant = await this.fetchRestaurent();

        const url =
            this.nodeEnv === "development"
                ? "https://retinawebsolutions.retail.lightspeed.app/api/1.0/token"
                : `${process.env.API_URL}/oauth/token`;

        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("client_id", restaurant.clientId);
        params.append("client_secret", restaurant.clientSecret);
        params.append("code", query.code);
        params.append(
            "redirect_uri",
            `${process.env.SERVER_URL}/lightspeed-auth/callback`
        );

        try {
            const response = await axios.post(url, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            console.log(response.data);
            return this.prisma.lightspeedToken.upsert({
                where: { id: 1 },
                update: {
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    expiresIn: new Date(
                        Date.now() + response.data.expires_in * 1000
                    ),
                },
                create: {
                    accessToken: response.data.access_token,
                    refreshToken: response.data.refresh_token,
                    tokenType: response.data.token_type,
                    expiresIn: new Date(
                        Date.now() + response.data.expires_in * 1000
                    ),
                },
            });
        } catch (error) {
            console.log(error);
            console.error(
                "Refresh Error:",
                error.response?.data || error.message
            );
        }
    }

    private async fetchRestaurent() {
        console.log(process.env.CLIENT_ID);
        console.log(process.env.CLIENT_SECRET);

        return {
            id: "46127256-6dd3-411c-ba19-31bab36b1664",
            clientId: process.env.CLIENT_ID as string,
            clientSecret: process.env.CLIENT_SECRET as string,
        };
    }
}
