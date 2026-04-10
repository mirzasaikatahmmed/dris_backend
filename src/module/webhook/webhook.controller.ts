// orders.controller.ts  or  webhooks.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
// import { OrdersService } from './orders.service';
import Stripe from 'stripe';
import { StripeService } from '../stripe/stripe.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private stripeService: StripeService) {}

  @Post()
  @Public()
  async stripeWebhook(@Req() req: Request) {
    // No need for RawBodyRequest here since we're using req.body directly
    console.log({ name: 'Alamin' });

    const sig = req.headers['stripe-signature'] as string | undefined;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      console.error('Missing signature or secret');
      throw new BadRequestException('Missing signature or webhook secret');
    }

    console.log({ sig, endpointSecret });

    let event: Stripe.Event;

    try {
      event = Stripe.webhooks.constructEvent(
        req.body as any, 
        sig,
        endpointSecret,
      );

      console.log('Signature verified! Event type:', event.type);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Now handle the event safely
    switch (event.type) {
      case 'checkout.session.completed':
        // console.log('Handling checkout.session.completed', event.data.object);
        await this.stripeService.handleCheckoutSessionCompleted(event);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
}
