  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { Type } from 'class-transformer';
  import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Min,
  } from 'class-validator';

  export class CreateModifierGroupDto {
    @ApiProperty({ example: 'restaurant-uuid' })
    @IsUUID()
    restaurantId: string;

    @ApiProperty({ example: 'Add Extras' })
    @IsString()
    @Length(1, 120)
    name: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isRequired?: boolean;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minSelect?: number;

    @ApiPropertyOptional({ example: 3, description: '0 = unlimited' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    maxSelect?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    displayOrder?: number;

    @ApiPropertyOptional({ example: 'lightspeed-group-id' })
    @IsOptional()
    @IsString()
    externalId?: string;
  }
