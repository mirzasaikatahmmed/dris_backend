// src/drivers/drivers.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DriversService } from "./drivers.service";
import { JwtAuthGuard } from "src/common/guard/jwt.guard";
import {
    GetUser,
    ValidateAdmin,
    ValidateDriver,
} from "src/common/decorators/jwt.decorator";
import { CreateDriverDto } from "./dto/create-driver.dto";
import { User } from "prisma/generated/prisma/browser";
import {
    successPaginatedResponse,
    successResponse,
} from "src/utils/response.utils";
import { UpdateDriverDto, UpdateOrderStatusDto } from "./dto/update-driver.dto";
import { FindQuery } from "./dto/find-driver.dto";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("drivers")
@ApiBearerAuth()
@Controller("drivers")
@UseGuards(JwtAuthGuard)
export class DriversController {
    constructor(
        private readonly driversService: DriversService,
        private readonly prisma: PrismaService
    ) {}

    @Post()
    @ValidateAdmin()
    @ApiOperation({ summary: "Create new driver (restaurant owner or admin)" })
    async create(@Body() dto: CreateDriverDto) {
        const result = await this.driversService.create(dto);
        return successResponse(result, "Driver created successfully");
    }

    @Get()
    @ApiOperation({ summary: "List all active drivers of a restaurant" })
    async findAll(
        @Query()
        dto: FindQuery
    ) {
        const result = await this.driversService.findAllByRestaurant(dto);
        return successPaginatedResponse(
            result.data,
            result.metadata,
            "Drivers retrieved successfully"
        );
    }

    @Get(":id")
    @ApiOperation({ summary: "Get single driver" })
    async findOne(@Param("id", ParseUUIDPipe) id: string) {
        const result = await this.driversService.findOne(id);
        return successResponse(result, "Driver retrieved successfully");
    }

    @Patch("assign/:driverId/:orderId")
    @ValidateAdmin()
    @ApiOperation({ summary: "Assign driver to an order (Admin Only)" })
    async assignDriver(
        @Param("driverId", ParseUUIDPipe) driverId: string,
        @Param("orderId", ParseUUIDPipe) orderId: string
    ) {
        const result = await this.driversService.assignDriver(
            driverId,
            orderId
        );
        return successResponse(result, "Driver assigned to order successfully");
    }

    @Patch("update-order-status/:orderId")
    @ValidateDriver()
    @ApiOperation({ summary: "Update order status by driver" })
    async updateOrderStatus(
        @Body() dto: UpdateOrderStatusDto,
        @Param("orderId", ParseUUIDPipe) orderId: string,
        @GetUser("id") userId: string
    ) {
        const result = await this.driversService.updateOrderStatusByDriver(
            userId,
            orderId,
            dto
        );
        return successResponse(result, "Order status updated successfully");
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update driver info" })
    async update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateDriverDto
    ) {
        const result = await this.driversService.update(id, dto);
        return successResponse(result, "Driver updated successfully");
    }

    @Patch(":id/online")
    @ValidateDriver()
    @ApiOperation({ summary: "Driver goes online" })
    async goOnline(@GetUser("id") id: string) {
        const driverId = await this.prisma.driver.findFirst({
            where: { userId: id },
        });
        const result = await this.driversService.toggleOnline(
            driverId?.id!,
            true
        );
        return successResponse(result, "Driver is now online");
    }

    @Patch(":id/offline")
    @ValidateDriver()
    @ApiOperation({ summary: "Driver goes offline" })
    async goOffline(@GetUser("id") id: string) {
        const driverId = await this.prisma.driver.findFirst({
            where: { userId: id },
        });
        const result = await this.driversService.toggleOnline(
            driverId?.id!,
            false
        );
        return successResponse(result, "Driver is now offline");
    }
}
