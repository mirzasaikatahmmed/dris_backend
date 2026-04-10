import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddCartItemOptionDto {
  @ApiProperty({ example: 'group-uuid' })
  @IsUUID()
  groupId: string;

  @ApiProperty({
    example: 'modifier-option-uuid',
    description: 'CartItemOption.itemId -> ModifierOption.id',
  })
  @IsUUID()
  itemId: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}

export class AddToCartDto {
  @ApiProperty({ example: 'restaurant-uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ example: 'product-uuid' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ example: 'variant-uuid' })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @ApiPropertyOptional({ type: [AddCartItemOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddCartItemOptionDto)
  options?: AddCartItemOptionDto[];
}

export class ChangeCartItemQuantityDto {
  @IsInt()
  @IsPositive()
  @IsOptional()
  amount?: number; // how much to increase/decrease (default = 1)
}

export class SetCartItemQuantityDto {
  @IsInt()
  @IsPositive()
  quantity: number; // absolute new quantity
}