import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedAuthService } from './lightspeed-auth.service';

describe('LightspeedAuthService', () => {
  let service: LightspeedAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightspeedAuthService],
    }).compile();

    service = module.get<LightspeedAuthService>(LightspeedAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
