import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedOrdersService } from './lightspeed-orders.service';

describe('LightspeedOrdersService', () => {
  let service: LightspeedOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightspeedOrdersService],
    }).compile();

    service = module.get<LightspeedOrdersService>(LightspeedOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
