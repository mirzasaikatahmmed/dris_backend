import {
    IsInt,
    IsArray,
    IsString,
    IsOptional,
    IsEnum,
    ValidateNested,
    IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ValidateIf } from "class-validator";

export enum OrderType {
    TAKEAWAY = "TAKEAWAY",
    DELIVERY = "DELIVERY",
}

export enum PaymentType {
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
    ONLINE_PAYMENT = "ONLINE_PAYMENT",
}

export class DiscountType {
    @ApiProperty({ example: "SUMMER20" })
    @IsString()
    code: string;

    @ApiProperty({ example: "Summer Discount" })
    @IsString()
    name: string;

    @ApiProperty({
        required: false,
        example: 15,
        description: "If it exists, the discountAmount should not be here",
    })
    @IsNumber()
    @IsOptional()
    discountPercentage?: number;

    @ApiProperty({
        required: false,
        example: 100,
        description: "If it exists, the discountPercentage should not be here",
    })
    @IsNumber()
    @IsOptional()
    discountAmount?: number;
}

// Modifier DTO
export class ItemModifierDto {
    @ApiProperty({
        example: "mod_123",
        description: "Modifier ID",
    })
    @IsString()
    modifierId: string;
}

// Order Item DTO
export class OrderItemDto {
    @ApiProperty({
        example: "Chilli Chicken Burger",
        description: "Product name snapshot",
    })
    @IsString()
    nameSnapshot: string;

    @ApiProperty({
        example: "sku_456",
        description: "Product SKU",
    })
    @IsString()
    sku: string;

    @ApiProperty({
        example: 2,
        description: "Quantity of the item",
    })
    @IsInt()
    quantity: number;

    @ApiProperty({
        type: "number",
        example: 8.29,
        description: "price of the product",
    })
    @IsNumber()
    unitPrice: number;

    @ApiPropertyOptional({
        type: [ItemModifierDto],
        description: "Optional modifiers for the item",
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemModifierDto)
    modifiers?: ItemModifierDto[];
}

// Delivery Address DTO
export class DeliveryAddressDto {
    @ApiProperty({
        example: "House 12, Road 5",
    })
    @IsString()
    addressLine1: string;

    @ApiProperty({
        example: "Dhaka",
    })
    @IsString()
    city: string;
}

// Main Create Order DTO
export class CreateOrderDto {
    @ApiProperty({
        example: 1,
        description: "Business location ID",
    })
    @IsInt()
    businessLocationId: number;

    @ApiProperty({
        name: "paymentType",
        enum: PaymentType,
        example: PaymentType.CASH_ON_DELIVERY,
    })
    @IsEnum(PaymentType)
    paymentType: PaymentType;

    @ApiProperty({
        enum: OrderType,
        example: OrderType.TAKEAWAY,
    })
    @IsEnum(OrderType)
    type: OrderType;

    @ApiProperty({
        type: () => DiscountType, // Use a function to avoid circular dependency issues
        description: "The details of the discount applied",
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => DiscountType)
    discountCode?: DiscountType;

    @ApiProperty({
        type: [OrderItemDto],
        description: "List of order items",
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiPropertyOptional({
        example: "No onions please",
    })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiPropertyOptional({
        type: DeliveryAddressDto,
        description: "Required if type is DELIVERY",
    })
    @IsOptional()
    @ValidateIf(o => o.type === OrderType.DELIVERY)
    @ValidateNested()
    @Type(() => DeliveryAddressDto)
    deliveryAddress?: DeliveryAddressDto;
}
