import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateAllergenDto {
  @ApiProperty({ example: 'Milk' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'MILK' })
  @IsString()
  @Length(1, 20)
  code: string;

  @ApiProperty({ example: 'Contains dairy', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
