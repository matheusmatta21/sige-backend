import { Test, TestingModule } from '@nestjs/testing';
import { SalesMapService } from './sales-map.service.js';

describe('SalesMapService', () => {
  let service: SalesMapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesMapService],
    }).compile();

    service = module.get<SalesMapService>(SalesMapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
