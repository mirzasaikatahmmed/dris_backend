import { Module } from "@nestjs/common";
import { LightspeedBusinessController } from "./lightspeed-business.controller";
import { LightspeedBusinessService } from "./lightspeed-business.service";

@Module({
    controllers: [LightspeedBusinessController],
    providers: [LightspeedBusinessService],
})
export class LightspeedBusinessModule {}
