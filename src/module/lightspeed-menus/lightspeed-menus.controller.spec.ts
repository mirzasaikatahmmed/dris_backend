import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedMenusController } from './lightspeed-menus.controller';

describe('LightspeedMenusController', () => {
  let controller: LightspeedMenusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LightspeedMenusController],
    }).compile();

    controller = module.get<LightspeedMenusController>(LightspeedMenusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
