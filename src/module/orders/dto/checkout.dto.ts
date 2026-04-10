import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, Length } from "class-validator";
import { OrderType } from "prisma/generated/prisma/enums";

export class CheckoutDto {
    @ApiProperty({ example: "cart-uuid" })
    @IsUUID()
    cartId: string;

    @ApiProperty({ enum: OrderType, example: OrderType.TAKEAWAY })
    @IsOptional()
    orderType: OrderType;

    @ApiPropertyOptional({ example: "address-uuid" })
    @IsOptional()
    @IsUUID()
    deliveryAddressId?: string;

    @ApiPropertyOptional({ example: "No onions please" })
    @IsOptional()
    @IsString()
    @Length(0, 2000)
    customerNotes?: string;

    @ApiPropertyOptional({ example: "CARD" })
    @IsOptional()
    @IsString()
    paymentMethod?: string;
}
