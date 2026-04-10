import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateModifierOptionDto {
  @ApiProperty({ example: 'group-uuid' })
  @IsUUID()
  groupId: string;

  @ApiProperty({ example: 'Extra Bacon' })
  @IsString()
  @Length(1, 120)
  name: string;

  @ApiProperty({ example: '2.00', description: 'Decimal as string' })
  @IsString()
  price: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ example: 'lightspeed-option-id' })
  @IsOptional()
  @IsString()
  externalId?: string;
}
