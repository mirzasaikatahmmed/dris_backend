import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WeekDay } from 'prisma/generated/prisma/enums';

export class FindRestaurantDto {
  @ApiPropertyOptional({ description: 'Filter by restaurant name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by active status', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by day when the restaurant is closed',
    enum: WeekDay,
  })
  @IsOptional()
  @IsEnum(WeekDay)
  offDay?: WeekDay;

  @ApiPropertyOptional({ description: 'Filter by delivery radius in kilometers', type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deliveryRadiusKm?: number;

  // Pagination
  @ApiPropertyOptional({ description: 'Page number for pagination', type: Number, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', type: Number, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
