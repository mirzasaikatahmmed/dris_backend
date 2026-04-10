import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedTokenService } from './lightspeed-token.service';

describe('LightspeedTokenService', () => {
  let service: LightspeedTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightspeedTokenService],
    }).compile();

    service = module.get<LightspeedTokenService>(LightspeedTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
