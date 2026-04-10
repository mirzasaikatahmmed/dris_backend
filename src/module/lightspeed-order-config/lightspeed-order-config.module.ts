import { Module } from "@nestjs/common";
import { LightspeedOrderConfigController } from "./lightspeed-order-config.controller";
import { LightspeedOrderConfigService } from "./lightspeed-order-config.service";
import { OrderConfigCacheService } from "./order-config.cache";

@Module({
    controllers: [LightspeedOrderConfigController],
    providers: [LightspeedOrderConfigService, OrderConfigCacheService],
})
export class LightspeedOrderConfigModule {}
