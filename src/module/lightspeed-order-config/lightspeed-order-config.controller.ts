import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from "@nestjs/common";
import { ApiParam, ApiTags } from "@nestjs/swagger";
import { ValidateAdmin } from "src/common/decorators/jwt.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { LightspeedOrderConfigService } from "./lightspeed-order-config.service";
import { CreateOrderConfigDto } from "./dto/create-config.dto";
import { UpdateOrderConfigDto } from "./dto/update-config.dto";

@ApiTags("Lightspeed Order Config")
@Controller("lightspeed-order-config")
export class LightspeedOrderConfigController {
    constructor(
        // config service
        private readonly lsOrderConfigService: LightspeedOrderConfigService
    ) {}

    @Get()
    @Public()
    async getAll() {
        return this.lsOrderConfigService.getAllConfig();
    }

    @Get(":businessLocationId")
    @Public()
    @ApiParam({
        name: "businessLocationId",
        type: Number,
        example: 1234567890,
    })
    async getSingleConfig(
        @Param("businessLocationId", ParseIntPipe) businessLocationId: number
    ) {
        return this.lsOrderConfigService.getSingleConfig(businessLocationId);
    }

    @Post()
    @ValidateAdmin()
    async createNewConfig(@Body() body: CreateOrderConfigDto) {
        return this.lsOrderConfigService.createNewConfig(body);
    }

    @Patch(":businessLocationId")
    @ValidateAdmin()
    @ApiParam({
        name: "businessLocationId",
        type: Number,
        example: 1234567890,
    })
    async update(
        @Param("businessLocationId", ParseIntPipe) businessLocationId: number,
        @Body() body: UpdateOrderConfigDto
    ) {
        return this.lsOrderConfigService.updateConfig(businessLocationId, body);
    }

    @Delete(":businessLocationId")
    @ValidateAdmin()
    @ApiParam({
        name: "businessLocationId",
        type: Number,
        example: 1234567890,
    })
    async deleteConfig(
        @Param("businessLocationId", ParseIntPipe) businessLocationId: number
    ) {
        return this.lsOrderConfigService.deleteConfig(businessLocationId);
    }
}
