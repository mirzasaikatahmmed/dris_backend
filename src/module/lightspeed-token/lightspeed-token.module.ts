import { Global, Module } from "@nestjs/common";
import { LightspeedTokenController } from "./lightspeed-token.controller";
import { LightspeedTokenService } from "./lightspeed-token.service";

@Global()
@Module({
    controllers: [LightspeedTokenController],
    providers: [LightspeedTokenService],
    exports: [LightspeedTokenService],
})
export class LightspeedTokenModule {}
