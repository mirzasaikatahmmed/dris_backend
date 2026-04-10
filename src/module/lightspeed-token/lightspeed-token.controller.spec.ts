import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedTokenController } from './lightspeed-token.controller';

describe('LightspeedTokenController', () => {
  let controller: LightspeedTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LightspeedTokenController],
    }).compile();

    controller = module.get<LightspeedTokenController>(LightspeedTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
