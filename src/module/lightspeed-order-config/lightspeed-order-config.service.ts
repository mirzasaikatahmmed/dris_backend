import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrderConfigCacheService } from "./order-config.cache";
import { CreateOrderConfigDto } from "./dto/create-config.dto";
import { UpdateOrderConfigDto } from "./dto/update-config.dto";

@Injectable()
export class LightspeedOrderConfigService {
    constructor(
        // prisma
        private readonly prisma: PrismaService,

        // cache service
        private readonly cache: OrderConfigCacheService
    ) {}

    // service --> get all config
    public async getAllConfig() {
        const configs = await this.prisma.orderConfig.findMany();

        console.log(configs);

        if (configs.length < 1) {
            throw new InternalServerErrorException(
                "Takeway Or Delivery System not configured properly. Kindly contact to admin."
            );
        }

        return configs;
    }

    // service --> get a single service
    public async getSingleConfig(businessLocationId: number) {
        // get it from cache if available
        const cached = this.cache.get(businessLocationId);

        if (cached) return cached;

        const config = await this.prisma.orderConfig.findUnique({
            where: {
                businessLocationId,
            },
        });

        // set to cache and return
        this.cache.set(config);

        return config;
    }

    //service --> create a new config
    public async createNewConfig(body: CreateOrderConfigDto) {
        // check if already exists
        const existing = await this.prisma.orderConfig.findUnique({
            where: { businessLocationId: body.businessLocationId },
        });

        if (existing) {
            throw new ConflictException(
                "Config already exists for this business location. If you want to make changes, kindly update it."
            );
        }

        const config = await this.prisma.orderConfig.create({
            data: {
                businessLocationId: body.businessLocationId,
                isTakeawayEnabled: body.isTakeawayEnabled,
                isDeliveryEnabled: body.isDeliveryEnabled,
            },
        });

        // update to cache
        this.cache.set(config);

        return config;
    }

    // service --> update an existing config
    public async updateConfig(
        businessLocationId: number,
        body: UpdateOrderConfigDto
    ) {
        // update in db
        const updated = await this.prisma.orderConfig
            .update({
                where: {
                    businessLocationId,
                },
                data: {
                    ...body,
                },
            })
            .catch(err => {
                // P2025 --> record not found
                if (err.code === "P2025") {
                    throw new NotFoundException(
                        `Config not found for businessLocationId ${businessLocationId}`
                    );
                }
                throw err;
            });

        // Update to cache
        this.cache.set(updated);

        return updated;
    }

    // service --> delete a service configuration
    public async deleteConfig(businessLocationId: number) {
        const deleted = await this.prisma.orderConfig
            .delete({
                where: {
                    businessLocationId,
                },
            })
            .catch(err => {
                if (err.code === "P2025") {
                    throw new NotFoundException(
                        `Config not found for business location ${businessLocationId}`
                    );
                }

                throw err;
            });

        console.log("Deleted : ", deleted);
        // delete from cache
        this.cache.delete(businessLocationId);

        return deleted;
    }

    // utility method --> get business location config
    private async getConfig(businessLocationId: number) {
        const cached = this.cache.get(businessLocationId);

        if (cached) return cached;

        const config = await this.prisma.orderConfig.findUnique({
            where: { businessLocationId },
        });

        if (!config) {
            throw new InternalServerErrorException(
                "Delivery or takeway configuration not configured, kindly contact"
            );
        }

        this.cache.set(config);
    }
}
