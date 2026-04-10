import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LightspeedTokenService } from "../lightspeed-token/lightspeed-token.service";
import {
    User,
    OrderType as PrismaOrderType,
} from "prisma/generated/prisma/client";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";
import * as crypto from "crypto";
import { instanceToPlain } from "class-transformer";

@Injectable()
export class LightspeedOrdersService {
    constructor(
        // token service
        private readonly tokenService: LightspeedTokenService,

        //prisma
        private readonly prisma: PrismaService
    ) {}

    // service --> create a to go order
    public async createToGoOrder(
        user: User,
        body: CreateOrderDto,
        businessLocationId: number
    ) {
        const accessToken = await this.tokenService.getAccessToken();
        // calculate totals
        let subtotal = 0;

        const orderItems = body.items.map(item => {
            const totalPrice = item.quantity * item.unitPrice;
            subtotal += totalPrice;

            return {
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice,
                modifiers: item.modifiers || null,
                nameSnapshot: item.nameSnapshot,
            };
        });

        // tax multiplier
        const taxMultiplier = (await this.getTaxRate(businessLocationId)) ?? 1;
        const tax = +(subtotal * (taxMultiplier - 1)).toFixed(2);

        // optional fees
        const getDeliveryFee = await this.prisma.orderConfig.findUnique({
            where: {
                businessLocationId,
            },
        });

        const deliveryFee = getDeliveryFee?.deliveryFee || 0;
        let discount;

        if (body.discountCode && body.discountCode.discountPercentage) {
            discount = subtotal * (body.discountCode.discountPercentage / 100);
        } else if (body.discountCode!.discountAmount) {
            discount = body.discountCode!.discountAmount;
        } else {
            discount = 0;
        }

        if (discount > subtotal) {
            discount = subtotal;
        }

        const total = +(subtotal + tax + deliveryFee - discount).toFixed(2);

        const order = await this.prisma.lightspeedOrder.create({
            data: {
                orderNumber: `LS-${Date.now()}`,
                customerId: user.id,
                businessLocationId,
                type: body.type,

                subtotal,
                tax,
                deliveryFee,
                discount,
                total,
                status: "PENDING",
                deliveryAddress: instanceToPlain(body.deliveryAddress),
                note: body.note,
                requestPayload: instanceToPlain(body),
            },
        });

        // lightspeed payload
        const payload = {
            businessLocationId,
            thirdPartyReference: order.orderNumber,
            endpointId: process.env.ENDPOINT_ID,
            customerInfo: {
                firstName: user.name || "Guest",
                lastName: "",
                email: user.email,
                contactNumberAsE164: user.phone || undefined,
                notes: body.note || undefined,
            },
            orderNote: body.note,
            maxTimeToAttemptOrderDeliverToPos: 60000,

            accountProfileCode:
                body.type === "DELIVERY" ? "DELIVERY" : "TAKE_AWAY",

            items: orderItems.map(item => ({
                quantity: item.quantity,
                sku: item.sku,
                customItemName: item.nameSnapshot,
                customItemPrice: item.unitPrice,

                modifiers: item.modifiers?.map(m => ({
                    modifierId: m.modifierId,
                })),

                discountCode: body.discountCode?.code || undefined,
            })),
            ...(body.type === "DELIVERY" && body.deliveryAddress
                ? {
                      deliveryAddress: {
                          addressLine1: body.deliveryAddress.addressLine1,
                          addressLine2: undefined,
                          city: body.deliveryAddress.city,
                      },
                  }
                : {}),
        };

        try {
            const response = await axios.post(
                `${process.env.API_URL}/o/op/1/order/toGo`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const lsResponse = response.data;
            const isSuccess = lsResponse?.status === "ok";

            if (!isSuccess) {
                throw new InternalServerErrorException(
                    "Lightspeed did not confirm order"
                );
            }

            await this.prisma.lightspeedOrderItem.createMany({
                data: orderItems.map(item => ({
                    orderId: order.id,
                    sku: item.sku,
                    nameSnapshot: item.nameSnapshot,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    modifiers: item.modifiers
                        ? instanceToPlain(item.modifiers)
                        : undefined,
                })),
            });

            await this.prisma.lightspeedOrder.update({
                where: { id: order.id },
                data: {
                    status: "CONFIRMED",
                    responsePayload: lsResponse,
                },
            });
        } catch (error) {}
    }

    private async getTaxRate(businessLocationId: number) {
        const accessToken = await this.tokenService.getAccessToken();

        const url = `${process.env.API_URL}//f/finance/${businessLocationId}/tax-rates`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const taxRate = response.data._embedded.taxRateList[0].rate;

            return taxRate;
        } catch (err) {
            console.log("error from getTaxRate method : ", err);
        }
    }
}
