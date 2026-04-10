import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsString,
    IsOptional,
    IsPhoneNumber,
    IsEmail,
    IsEnum,
    IsUUID,
    IsInt,
} from "class-validator";
import { VehicleType } from "prisma/generated/prisma/enums";

export class CreateDriverDto {
    @ApiProperty({
        name: "businessLocationId",
        example: 1234567890,
        type: Number,
    })
    @IsInt()
    businessLocationId: number;

    @ApiProperty({ example: "Rahim Khan" })
    @IsString()
    fullName: string;

    @ApiProperty({ example: "+8801712345678" })
    @IsPhoneNumber("BD")
    phone: string;

    @ApiProperty({ example: "rahim.khan@delivery.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "secret123" })
    @IsString()
    password: string;

    @ApiPropertyOptional({ enum: VehicleType, example: VehicleType.MOTORCYCLE })
    @IsOptional()
    @IsEnum(VehicleType)
    vehicleType?: VehicleType;

    @ApiPropertyOptional({ example: "DHA-MET-AB-1234" })
    @IsOptional()
    @IsString()
    vehicleNumber?: string;

    @ApiPropertyOptional({
        example: "https://cdn.example.com/drivers/rahim.jpg",
    })
    @IsOptional()
    @IsString()
    profileImageUrl?: string;
}
