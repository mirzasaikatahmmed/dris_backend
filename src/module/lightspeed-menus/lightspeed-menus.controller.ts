import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";
import { LightspeedMenusService } from "./lightspeed-menus.service";

@ApiTags("Lightspeed Menus")
@Controller("lightspeed-menus")
export class LightspeedMenusController {
    constructor(
        // lightspeed menus service
        private readonly lsMenusService: LightspeedMenusService
    ) {}

    @Public()
    @Get()
    @ApiQuery({
        name: "businessLocationId",
        required: true,
        type: Number,
        example: 123456789,
    })
    async getAllMenues(
        @Query("businessLocationId", ParseIntPipe) businessLocationId: number
    ) {
        return this.lsMenusService.getAllMenus(businessLocationId);
    }

    @Public()
    @Get(":menuId")
    @ApiQuery({
        name: "businessLocationId",
        required: true,
        type: Number,
        example: 123456789,
    })
    @ApiParam({
        name: "menuId",
        required: true,
        type: Number,
        example: 987654321,
    })
    async getSingleMenu(
        @Param("menuId", ParseIntPipe) menuId: number,
        @Query("businessLocationId", ParseIntPipe) businessLocationId: number
    ) {
        return this.lsMenusService.getSingleMenu(menuId, businessLocationId);
    }

    @Public()
    @Get("modifiers")
    @ApiQuery({
        name: "businessLocationId",
        required: true,
        type: Number,
        example: 123456789,
    })
    async getModifiers(
        @Query("businessLocationId", ParseIntPipe) businessLocationId: number
    ) {
        return this.lsMenusService.getModifiers(businessLocationId);
    }

    @Public()
    @Get("discount-codes")
    @ApiQuery({
        name: "businessLocationId",
        required: true,
        type: Number,
        example: 123456789,
    })
    async getDiscountCodes(
        @Query("businessLocationId", ParseIntPipe) businessLocationId: number
    ) {
        
    }
}
