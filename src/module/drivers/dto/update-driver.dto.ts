import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from "class-validator";
import { OrderStatus, VehicleType } from "prisma/generated/prisma/enums";

export class UpdateDriverDto {
    @ApiPropertyOptional({
        name: "fullName",
        example: "Md H Hasan",
        type: "string",
    })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({
        name: "phone",
        example: "+8801712345678",
        type: "string",
    })
    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @ApiPropertyOptional({
        name: "email",
        example: "pr0@gmail.com",
        type: "string",
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        enum: VehicleType,
        example: VehicleType.MOTORCYCLE,
        name: "vehicleType",
    })
    @IsOptional()
    @IsEnum(VehicleType)
    vehicleType?: VehicleType;

    @ApiPropertyOptional({
        name: "vehicleNumber",
        example: "DHA-MET-HA-1796",
        type: "string",
    })
    @IsOptional()
    @IsString()
    vehicleNumber?: string;

    @ApiPropertyOptional({
        name: "isActive",
        type: "boolean",
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        name: "isOnline",
        type: "boolean",
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isOnline?: boolean;

    @ApiPropertyOptional({
        name: "isAvailable",
        type: "boolean",
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ example: OrderStatus.PREPARING, name: "status" })
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}
