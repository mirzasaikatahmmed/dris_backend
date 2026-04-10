import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartsService } from './carts.service';
import { AddToCartDto, ChangeCartItemQuantityDto } from './dto/add-to-cart.dto';
import { GetUser, ValidateUser } from 'src/common/decorators/jwt.decorator';
import { successResponse } from 'src/utils/response.utils';

@ApiTags('Carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly service: CartsService) {}

  @Post('add')
  @ValidateUser()
  async add(@Body() dto: AddToCartDto, @GetUser('id') userId: string) {
    const result = await this.service.addToCart(dto, userId);
    return successResponse(result, 'Cart item added successfully');
  }

  @Get('active')
  async getActive(
    @Query('restaurantId') restaurantId: string,
    @GetUser('id') userId: string,
  ) {
    const result = await this.service.getActiveCart(restaurantId, userId);
    return successResponse(result, 'Active cart retrieved successfully');
  }

  @Patch('items/:id/increase')
  increaseQuantity(
    @Param('id') cartItemId: string,
    @Body() dto: ChangeCartItemQuantityDto,
    @GetUser('id') userId: string,
  ) {
    return this.service.increaseItemQuantity(cartItemId, dto, userId);
  }

  @Patch('items/:id/decrease')
  decreaseQuantity(
    @Param('id') cartItemId: string,
    @Body() dto: ChangeCartItemQuantityDto,
    @GetUser('id') userId: string,
  ) {
    return this.service.decreaseItemQuantity(cartItemId, dto, userId);
  }

  @Delete('items/:cartItemId')
  async removeItem(@Param('cartItemId') cartItemId: string) {
    const result = await this.service.removeItem(cartItemId);
    return successResponse(result, 'Cart item removed successfully');
  }
}
