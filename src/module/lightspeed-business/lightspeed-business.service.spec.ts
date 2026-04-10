import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedBusinessService } from './lightspeed-business.service';

describe('LightspeedBusinessService', () => {
  let service: LightspeedBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightspeedBusinessService],
    }).compile();

    service = module.get<LightspeedBusinessService>(LightspeedBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
