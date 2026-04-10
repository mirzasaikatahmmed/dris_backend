import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhooksController } from './webhook.controller';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  controllers: [WebhooksController],
  providers: [WebhookService],
  exports: [WebhookService],
  imports: [StripeModule]
})
export class WebhookModule {}
