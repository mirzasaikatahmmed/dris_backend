import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { GetUser, ValidateUser } from 'src/common/decorators/jwt.decorator';
import { successResponse } from 'src/utils/response.utils';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post('checkout')
  @ValidateUser()
  async checkout(@Body() dto: CheckoutDto, @GetUser('id') userId: string) {
    const result = await this.service.checkout(dto, userId);
    return successResponse(result, 'Order created successfully');
  }

  @Get('my-orders')
 async myOrder(@GetUser('id') userId: string) {
    const result = await  this.service.myOrder(userId);
    return successResponse(result, 'My orders retrieved successfully');
  }

  @Get(':id')
  @ValidateUser()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
