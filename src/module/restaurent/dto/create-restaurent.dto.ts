// src/restaurants/dto/create-restaurant.dto.ts
import {
    IsString,
    IsOptional,
    IsNumber,
    IsArray,
    IsLatitude,
    IsLongitude,
    IsUrl,
    MaxLength,
    IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WeekDay } from "prisma/generated/prisma/enums";
import { Type } from "class-transformer";

// Day of the week enum

export class CreateRestaurentDto {
    @ApiProperty({ description: "Name of the restaurant", maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name: string;

    // lightspeed client id and client secret
    @ApiProperty({ name: "clientId", description: "client id from lightspeed" })
    @IsString()
    @MaxLength(255)
    clientId: string;

    @ApiProperty({
        name: "clientSecret",
        description: "client secret from lightspeed",
    })
    @IsString()
    @MaxLength(255)
    clientSecret: string;

    @ApiPropertyOptional({ description: "Description of the restaurant" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: "Address of the restaurant" })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({
        description: "Array of image URLs for the restaurant",
        type: [String],
        example: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
        ],
    })
    @IsArray()
    @IsUrl({ require_tld: false }, { each: true })
    @IsOptional()
    images?: string[];

    @ApiPropertyOptional({
        description: "Phone number of the restaurant",
        maxLength: 20,
    })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    phone?: string;

    @ApiPropertyOptional({
        description: "Is the restaurant active?",
        type: Boolean,
        default: true,
    })
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: "Delivery radius in kilometers",
        type: Number,
    })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    deliveryRadiusKm?: number;

    @ApiPropertyOptional({
        description: "Allowed postcodes for delivery",
        type: Object,
        example: { "1000": true, "2000": true },
    })
    @IsOptional()
    allowedPostcodes?: Record<string, any>;

    @ApiPropertyOptional({
        description: "Opening time of the restaurant in HH:MM format",
        example: "10:00",
    })
    @IsString()
    @IsOptional()
    openingHour?: string;

    @ApiPropertyOptional({
        description: "Closing time of the restaurant in HH:MM format",
        example: "22:00",
    })
    @IsString()
    @IsOptional()
    closingHour?: string;

    @ApiPropertyOptional({
        description: "Day of the week when the restaurant is closed",
        enum: WeekDay,
    })
    @IsEnum(WeekDay)
    @IsOptional()
    offDay?: WeekDay;

    @ApiPropertyOptional({ description: "Kitchen API URL" })
    @IsString()
    @IsOptional()
    kitchenApiUrl?: string;

    @ApiPropertyOptional({ description: "Kitchen API key" })
    @IsString()
    @IsOptional()
    kitchenApiKey?: string;
}
