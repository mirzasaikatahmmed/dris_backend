import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { CreateRestaurentDto } from "./dto/create-restaurent.dto";
import { UpdateRestaurentDto } from "./dto/update-restaurent.dto";
import { PrismaService } from "../prisma/prisma.service";
import { FindRestaurantDto } from "./dto/find-restaurent.dto";

@Injectable()
export class RestaurentService {
    constructor(private prisma: PrismaService) {}

    async create(createRestaurantDto: CreateRestaurentDto) {
        const isRestaurentExist = await this.prisma.restaurant.findFirst({
            where: { name: createRestaurantDto.name },
        });
        if (isRestaurentExist) {
            throw new BadRequestException("Restaurent name already exist");
        }
        if (createRestaurantDto.address) {
        }
        const restaurant = await this.prisma.restaurant.create({
            data: {
                ...createRestaurantDto,
                deliveryRadiusKm: createRestaurantDto.deliveryRadiusKm
                    ? createRestaurantDto.deliveryRadiusKm.toString()
                    : "8.0",
            },
        });

        return this.mapToResponseDto(restaurant);
    }

    async findAll(dto: FindRestaurantDto) {
        const {
            name,
            deliveryRadiusKm,
            isActive,
            limit = 10,
            page = 1,
            offDay,
        } = dto;
        const skip = (page - 1) * limit;

        const where: any = { deletedAt: null }; // base filter

        // Filter by isActive
        if (typeof isActive === "boolean") {
            where.isActive = isActive;
        }

        // Filter by partial name match
        if (name) {
            where.name = { contains: name, mode: "insensitive" };
        }

        // Filter by offDay
        if (offDay) {
            where.offDay = offDay;
        }

        // Filter by deliveryRadiusKm (example: restaurants with radius >= provided)
        if (deliveryRadiusKm) {
            where.deliveryRadiusKm = { gte: deliveryRadiusKm };
        }

        const restaurants = await this.prisma.restaurant.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                categories: true,
                menus: true,
                products: true,
            },
        });

        const total = await this.prisma.restaurant.count({ where });
        return {
            data: restaurants,
            metadata: {
                page,
                limit,
                total,
            },
        };
    }

    async findOne(id: string) {
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { id },
        });

        if (!restaurant || restaurant.deletedAt) {
            throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }

        return this.mapToResponseDto(restaurant);
    }

    async update(id: string, updateRestaurantDto: UpdateRestaurentDto) {
        const existing = await this.prisma.restaurant.findUnique({
            where: { id },
        });

        if (!existing || existing.deletedAt) {
            throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }

        const updated = await this.prisma.restaurant.update({
            where: { id },
            data: {
                ...updateRestaurantDto,
            },
        });

        return this.mapToResponseDto(updated);
    }

    async remove(id: string): Promise<void> {
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { id },
        });

        if (!restaurant || restaurant.deletedAt) {
            throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }

        await this.prisma.restaurant.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    // Optional: hard delete
    async hardDeleted(id: string): Promise<void> {
        const restaurant = await this.prisma.restaurant.findUnique({
            where: { id },
        });

        if (!restaurant || restaurant.deletedAt) {
            throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }
        await this.prisma.restaurant.delete({
            where: { id },
        });
    }

    private mapToResponseDto(restaurant: any) {
        return {
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description ?? undefined,
            address: restaurant.address ?? undefined,
            latitude: restaurant.latitude
                ? Number(restaurant.latitude)
                : undefined,
            longitude: restaurant.longitude
                ? Number(restaurant.longitude)
                : undefined,
            images: restaurant.images ?? [],
            phone: restaurant.phone ?? undefined,
            isActive: restaurant.isActive,
            deliveryRadiusKm: Number(restaurant.deliveryRadiusKm),
            allowedPostcodes: restaurant.allowedPostcodes ?? undefined,
            businessHours: restaurant.businessHours ?? undefined,
            kitchenApiUrl: restaurant.kitchenApiUrl ?? undefined,
            createdAt: restaurant.createdAt,
            updatedAt: restaurant.updatedAt,
            deletedAt: restaurant.deletedAt ?? undefined,
        };
    }
}
