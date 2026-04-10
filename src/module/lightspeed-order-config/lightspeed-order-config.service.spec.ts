import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedOrderConfigService } from './lightspeed-order-config.service';

describe('LightspeedOrderConfigService', () => {
  let service: LightspeedOrderConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightspeedOrderConfigService],
    }).compile();

    service = module.get<LightspeedOrderConfigService>(LightspeedOrderConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
