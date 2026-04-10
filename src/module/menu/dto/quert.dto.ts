import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {  IsNumber, IsOptional, IsString, Min } from "class-validator";

export class MenuQueryDto {
  @ApiPropertyOptional({
      description: 'Search by restaurant name',
      example: '',
    })
    @IsString()
    @IsOptional()
    search?: string;
  
    @ApiPropertyOptional({
      description: 'Filter by delivery radius (find restaurants covering at least X km)',
      example: 5,
    })
    @Type(() => Number) // Converts string query param to number
    @IsNumber()
    @IsOptional()
    deliveryRadiusKm?: number;
  
    @ApiPropertyOptional({
      description: 'Page number for pagination',
      default: 1,
      example: 1,
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page?: number = 1;
}