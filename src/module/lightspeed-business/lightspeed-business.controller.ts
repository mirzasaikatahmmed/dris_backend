import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";
import { LightspeedBusinessService } from "./lightspeed-business.service";

@ApiTags("Lightspeed Business Locations")
@Controller("lightspeed-business")
export class LightspeedBusinessController {
    constructor(
        // lightspeed business service
        private readonly lsBusinessService: LightspeedBusinessService
    ) {}

    @Get("location-summery")
    @Public()
    public async getLocationSummery() {
        return this.lsBusinessService.getLocationSummery();
    }

    @Get("location-details")
    @Public()
    public async getLocationDetail() {
        return this.lsBusinessService.getLocationDetails();
    }
}
