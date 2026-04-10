import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedOrderConfigController } from './lightspeed-order-config.controller';

describe('LightspeedOrderConfigController', () => {
  let controller: LightspeedOrderConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LightspeedOrderConfigController],
    }).compile();

    controller = module.get<LightspeedOrderConfigController>(LightspeedOrderConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
