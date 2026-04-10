import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedBusinessController } from './lightspeed-business.controller';

describe('LightspeedBusinessController', () => {
  let controller: LightspeedBusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LightspeedBusinessController],
    }).compile();

    controller = module.get<LightspeedBusinessController>(LightspeedBusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
