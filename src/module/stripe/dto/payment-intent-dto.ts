import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaymentDto {
  @ApiProperty({
    description: 'The amount to be paid',
    example: 100.5,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'The currency of the payment',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'The ID of the cart to be checked out',
    example: 'cart-123',
  })
  @IsString()
  @IsNotEmpty()
  cartId: string;
}