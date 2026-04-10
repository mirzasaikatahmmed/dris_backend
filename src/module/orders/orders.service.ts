import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CheckoutDto } from './dto/checkout.dto';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private stripeService: StripeService) { }
  
  

  async checkout(dto: CheckoutDto, userId: string) {

    const res = await this.stripeService.createCheckoutSession({userId, cartId:dto.cartId, customerNotes: dto.customerNotes, orderType: dto.orderType});
    return {...dto, userId, stripeSession: res}
    
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { options: true, product: true, variant: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async myOrder(userId: string) {
    const result = await this.prisma.order.findMany({where: {userId}})
    return result || [];
  }


  
}
