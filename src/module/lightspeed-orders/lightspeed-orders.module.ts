import { Module } from '@nestjs/common';
import { LightspeedOrdersController } from './lightspeed-orders.controller';
import { LightspeedOrdersService } from './lightspeed-orders.service';

@Module({
  controllers: [LightspeedOrdersController],
  providers: [LightspeedOrdersService]
})
export class LightspeedOrdersModule {}
