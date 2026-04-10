import { Module } from '@nestjs/common';
import { LightspeedMenusController } from './lightspeed-menus.controller';
import { LightspeedMenusService } from './lightspeed-menus.service';

@Module({
  controllers: [LightspeedMenusController],
  providers: [LightspeedMenusService]
})
export class LightspeedMenusModule {}
