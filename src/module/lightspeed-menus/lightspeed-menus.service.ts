import { Injectable, NotFoundException } from "@nestjs/common";
import { LightspeedTokenService } from "../lightspeed-token/lightspeed-token.service";
import axios from "axios";

@Injectable()
export class LightspeedMenusService {
    constructor(private readonly lsTokenService: LightspeedTokenService) {}

    // service --> get lightspeed all menues for a single business location
    public async getAllMenus(businessLocationId: number) {
        const accessToken = this.lsTokenService.getAccessToken();
        try {
            const response = await axios.get(
                `${process.env.API_URL}/o/op/1/menu/list?businessLocationId=${businessLocationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const menus = response.data;

            if (!menus) {
                throw new NotFoundException("Menus not found");
            }
            return menus;
        } catch (error) {
            console.log("Error in getAllMenus Method : ", error);
            throw error;
        }
    }

    // service --> get lightspeed single menu
    public async getSingleMenu(menuId: number, businessLocationId: number) {
        const accessToken = this.lsTokenService.getAccessToken();

        try {
            const response = await axios.get(
                `${process.env.API_URL}/o/op/1/menu/load/${menuId}?businessLocationId=${businessLocationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const menu = response.data;

            if (menu.menuName.length < 1) {
                throw new NotFoundException("Detailed menu not found");
            }
        } catch (error) {
            console.log("Error in getSingleMenu Method : ", error);
            throw error;
        }
    }

    // service --> get lightspeed modifiers
    public async getModifiers(businessLocationId: number) {
        const accessToken = await this.lsTokenService.getAccessToken();

        try {
            const response = await axios.get(
                `${process.env.API_URL}/o/op/1/menu/modifiers?businessLocationId=${businessLocationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const modifiers = response.data;

            if (modifiers.length < 1) {
                throw new NotFoundException("Modifiers not found");
            }
        } catch (error) {
            console.log("Error in getModifiers Method : ", error);
            throw error;
        }
    }

    // service --> get lightspeed discounts
    public async getDiscountCodes(businessLocationId: number) {
        const accessToken = await this.lsTokenService.getAccessToken();

        try {
            const response = await axios.get(
                `${process.env.API_URL}/o/op/1/menu/modifiers?businessLocationId=${businessLocationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const discountCodes = response.data;

            if (!discountCodes || discountCodes.length < 1) {
                throw new NotFoundException("No coupons available");
            }
        } catch (error) {
            console.log("Error in getDiscountCodes Method : ", error);
            throw error;
        }
    }
}
