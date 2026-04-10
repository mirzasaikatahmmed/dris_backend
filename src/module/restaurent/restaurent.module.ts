import { Module } from '@nestjs/common';
import { RestaurentService } from './restaurent.service';
import { RestaurentController } from './restaurent.controller';

@Module({
  controllers: [RestaurentController],
  providers: [RestaurentService],
})
export class RestaurentModule {}
