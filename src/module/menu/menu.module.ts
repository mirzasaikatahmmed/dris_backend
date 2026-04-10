import { Module } from '@nestjs/common';
import { MenusController } from './menu.controller';
import { MenusService } from './menu.service';
// import { MenusService } from './menu.service';


@Module({
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenuModule {}
