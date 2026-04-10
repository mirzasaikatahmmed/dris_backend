import { Test, TestingModule } from '@nestjs/testing';
import { LightspeedMenusService } from './lightspeed-menus.service';

describe('LightspeedMenusService', () => {
  let service: LightspeedMenusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LightspeedMenusService],
    }).compile();

    service = module.get<LightspeedMenusService>(LightspeedMenusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
