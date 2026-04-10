import { Module } from '@nestjs/common';
import { LightspeedAuthService } from './lightspeed-auth.service';
import { LightspeedAuthController } from './lightspeed-auth.controller';

@Module({
  providers: [LightspeedAuthService],
  controllers: [LightspeedAuthController]
})
export class LightspeedAuthModule {}
