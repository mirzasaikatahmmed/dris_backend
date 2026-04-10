import { Controller, Get, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { LightspeedAuthService } from "./lightspeed-auth.service";
import { Public } from "src/common/decorators/public.decorator";

@ApiTags("Lightspeed Auth")
@Controller("lightspeed-auth")
export class LightspeedAuthController {
    constructor(
        //lightspeed auth service
        private readonly lsAuthService: LightspeedAuthService
    ) {}

    @Get("request-uri")
    async requestURI() {
        return this.lsAuthService.getAccessURI();
    }

    @Public()
    @Get("callback")
    async getAuthCodeAndRequestToken(@Query() query: any) {
        return this.lsAuthService.lightSpeedCallback(query);
    }
}
