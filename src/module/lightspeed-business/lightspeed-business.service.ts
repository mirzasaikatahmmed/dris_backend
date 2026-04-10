import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import axios from "axios";
import { LightspeedTokenService } from "../lightspeed-token/lightspeed-token.service";

@Injectable()
export class LightspeedBusinessService {
    constructor(private readonly lsTokenService: LightspeedTokenService) {}

    public async getLocationSummery() {
        const accessToken = await this.lsTokenService.getAccessToken();
        try {
            const response = await axios.get(
                `${process.env.API_URL}/o/op/data/businesses`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log(response.data);

            return {
                locations: response.data.businessLocations,
            };
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    public async getLocationDetails() {
        const accessToken = await this.lsTokenService.getAccessToken();

        try {
            const response = await axios.get(
                `${process.env.API_URL}/reservation/api/1/user/platform/${process.env.PLATFORM_CODE}/business-locations`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const locations = response.data;

            if (!locations || locations.length < 1) {
                throw new NotFoundException(
                    "No Business locations found in the system"
                );
            }

            return locations;
        } catch (error) {
            console.error("Axios error in location details: ", error);
            throw error;
        }
    }
}
