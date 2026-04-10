import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedAuthController } from './lightspeed-auth.controller';

describe('LightspeedAuthController', () => {
  let controller: LightspeedAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LightspeedAuthController],
    }).compile();

    controller = module.get<LightspeedAuthController>(LightspeedAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
