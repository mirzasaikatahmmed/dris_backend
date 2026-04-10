import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedOrdersController } from './lightspeed-orders.controller';

describe('LightspeedOrdersController', () => {
  let controller: LightspeedOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LightspeedOrdersController],
    }).compile();

    controller = module.get<LightspeedOrdersController>(LightspeedOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
