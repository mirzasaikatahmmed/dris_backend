import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateVariantDto } from './create-variant.dto';


export class IngredientDto {
  @ApiProperty({
    example: 'Cheddar Cheese',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRemovable: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'restaurant-uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Crispy Potato Chunks' })
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiPropertyOptional({ example: 'Crispy potato chunks topped with...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: 'lightspeed-product-id' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({
    example: [
      { name: 'Cheddar Cheese', isRemovable: true },
      { name: 'Sour Cream', isRemovable: true },
      { name: 'Green Onions', isRemovable: false },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients?: IngredientDto[];

  @ApiPropertyOptional({
    description: 'Allergen IDs to attach',
    example: ['allergen-uuid-1', 'allergen-uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  allergenIds?: string[];

  @ApiPropertyOptional({
    description: 'Modifier group IDs to attach to this product',
    example: ['group-uuid-1'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  modifierGroupIds?: string[];

  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}
