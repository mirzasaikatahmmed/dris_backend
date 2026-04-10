import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt } from "class-validator";

export class CreateOrderConfigDto {
    @ApiProperty({
        name: "businessLocationId",
        type: "number",
        example: 1234567890,
    })
    @IsInt()
    businessLocationId: number;

    @ApiProperty({
        name: "isTakeawayEnabled",
        type: "boolean",
        example: true,
    })
    @IsBoolean()
    isTakeawayEnabled: boolean;

    @ApiProperty({
        name: "isDeliveryEnabled",
        type: "boolean",
        example: false,
    })
    @IsBoolean()
    isDeliveryEnabled: boolean;
}
