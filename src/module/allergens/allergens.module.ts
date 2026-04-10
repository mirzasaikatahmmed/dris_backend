import { Module } from '@nestjs/common';
import { AllergensController } from './allergens.controller';
import { AllergensService } from './allergens.service';

@Module({
  controllers: [AllergensController],
  providers: [AllergensService],
  exports: [AllergensService],
})
export class AllergensModule {}
