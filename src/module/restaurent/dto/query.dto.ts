// src/restaurants/dto/restaurant-query.dto.ts
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  Min, 
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RestaurantQueryDto {
  @ApiPropertyOptional({
    description: 'Search by restaurant name',
    example: '',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @Type(() => Boolean) // Converts string 'true'/'false' from query to boolean
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

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

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  
}