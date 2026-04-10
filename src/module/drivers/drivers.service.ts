// src/drivers/drivers.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDriverDto } from "./dto/create-driver.dto";
import { UpdateDriverDto, UpdateOrderStatusDto } from "./dto/update-driver.dto";
import * as bcrypt from "bcrypt";
import { OrderStatus, Role } from "prisma/generated/prisma/enums";
import { FindQuery } from "./dto/find-driver.dto";
import e from "express";

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateDriverDto) {
        const isUserExist = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (isUserExist) {
            throw new BadRequestException("User already exists");
        }
        const hashedPassword = await bcrypt.hash(
            dto.password,
            process.env.SALT_ROUNDS || 10
        );

        const result = await this.prisma.$transaction(async tx => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    role: Role.DRIVER,
                    phone: dto.phone,
                    name: dto.fullName,
                    isVerified: true,
                },
            });
            const driver = await tx.driver.create({
                data: {
                    businessLocationId: dto.businessLocationId,
                    vehicleType: dto.vehicleType,
                    vehicleNumber: dto.vehicleNumber,
                    profileImageUrl: dto.profileImageUrl,
                    rating: 5.0,
                    totalRatings: 0,
                    completedOrders: 0,
                    userId: user.id,
                },
                include: { user: true },
            });
            return driver;
        });

        return result;
    }

    async findAllByRestaurant(dto: FindQuery) {
        const { businessLocationId, page = 1, limit = 10 } = dto;

        const isDeliveryAvailable = await this.prisma.orderConfig.findUnique({
            where: { businessLocationId: businessLocationId },
        });

        if (!isDeliveryAvailable?.isDeliveryEnabled) {
            throw new BadRequestException(
                "Delivery is not available for this business location."
            );
        }

        const skip = (page - 1) * limit;
        const drivers = await this.prisma.driver.findMany({
            where: { businessLocationId },
            orderBy: { createdAt: "asc" },
            skip,
            take: limit,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        id: true,
                        isActive: true,
                        isBlocked: true,
                    },
                },
            },
        });
        const total = await this.prisma.driver.count({
            where: { businessLocationId },
        });
        return {
            data: drivers,
            metadata: {
                total,
                page,
                limit,
            },
        };
    }

    async findOne(id: string, restaurantId?: string) {
        const driver = await this.prisma.driver.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        id: true,
                        isActive: true,
                        isBlocked: true,
                    },
                },
            },
        });

        if (!driver) throw new NotFoundException("Driver not found");

        return driver;
    }

    async update(id: string, dto: UpdateDriverDto) {
        const isDriverExist = await this.findOne(id);
        const { fullName, phone, email, ...restData } = dto;

        const result = await this.prisma.$transaction(async tx => {
            if (fullName || phone || email) {
                const user = await tx.user.update({
                    where: { id: isDriverExist.userId },
                    data: {
                        name: fullName || isDriverExist.user.name,
                        phone: phone || isDriverExist.user.phone,
                        email: email || isDriverExist.user.email,
                    },
                });
            }
            const updated = await tx.driver.update({
                where: { id },
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                },
                data: restData,
            });
            return updated;
        });

        return this.toResponse(result);
    }

    async toggleOnline(id: string, online: boolean) {
        const driver = await this.findOne(id);

        if (!driver.isActive) {
            throw new BadRequestException("Driver account is inactive");
        }

        const updated = await this.prisma.driver.update({
            where: { id },
            data: {
                isOnline: online,
                isAvailable: online ? true : driver.isAvailable, // only set available when going online
            },
        });

        return this.toResponse(updated);
    }

    async assignDriver(driverId: string, orderId: string) {
        const driver = await this.prisma.driver.findFirst({
            where: { id: driverId },
        });
        if (!driver) {
            throw new NotFoundException("Driver not found");
        }

        const isOrderExist = await this.prisma.lightspeedOrder.findFirst({
            where: { id: orderId, status: "PENDING" },
        });

        if (!isOrderExist) {
            throw new NotFoundException("Order not found or not pending");
        }

        if (isOrderExist?.type === "TAKEAWAY") {
            throw new BadRequestException(
                "Cannot assign driver to pickup orders"
            );
        }

        console.log("Hit here");

        const updatedOrder = await this.prisma.lightspeedOrder.update({
            where: { id: orderId },
            data: { driverId: driverId },
        });

        console.log("Hit here in updated route", updatedOrder);

        // send notification to customer

        return updatedOrder;
    }

    async updateOrderStatusByDriver(
        userId: string,
        orderId: string,
        dto: UpdateOrderStatusDto
    ) {
        const driver = await this.prisma.driver.findFirst({
            where: { userId: userId },
        });
        if (!driver) {
            throw new NotFoundException("Driver not found");
        }

        const order = await this.prisma.lightspeedOrder.findUnique({
            where: { id: orderId },
            include: { driver: true },
        });

        if (!order || order.driverId !== driver.id) {
            throw new BadRequestException(
                "You are not authorized to update this order"
            );
        }

        const updatedOrder = await this.prisma.lightspeedOrder.update({
            where: { id: orderId },
            data: { status: dto.status },
        });

        // Send notification to both admin and customer

        return updatedOrder;
    }

    private toResponse(driver: any) {
        return {
            id: driver.id,
            restaurantId: driver.restaurantId,
            fullName: driver.fullName,
            phone: driver.phone,
            email: driver.email,
            vehicleType: driver.vehicleType,
            vehicleNumber: driver.vehicleNumber,
            profileImageUrl: driver.profileImageUrl,
            isActive: driver.isActive,
            isOnline: driver.isOnline,
            isAvailable: driver.isAvailable,
            rating: driver.rating,
            totalRatings: driver.totalRatings,
            completedOrders: driver.completedOrders,
            createdAt: driver.createdAt,
        };
    }
}
