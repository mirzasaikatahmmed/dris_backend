import { Body, Controller, Post, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { User } from "prisma/generated/prisma/client";
import { GetUser, ValidateUser } from "src/common/decorators/jwt.decorator";
import { CreateOrderDto } from "./dto/create-order.dto";
import { LightspeedOrdersService } from "./lightspeed-orders.service";

@ApiTags("Lightspeed Orders")
@Controller("lightspeed-orders")
export class LightspeedOrdersController {
    constructor(private readonly lsOrderService: LightspeedOrdersService) {}

    @Post()
    @ValidateUser()
    @ApiQuery({
        name: "businessLocationId",
        type: Number,
        example: 1234567890,
    })
    async createOrder(
        @GetUser() user: User,
        @Body() body: CreateOrderDto,
        @Query("businessLocationId") businessLocationId: number
    ) {
        return this.lsOrderService.createToGoOrder(
            user,
            body,
            businessLocationId
        );
    }
}
