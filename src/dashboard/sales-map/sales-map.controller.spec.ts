import { Test, TestingModule } from '@nestjs/testing';
import { SalesMapController } from './sales-map.controller.js';

describe('SalesMapController', () => {
  let controller: SalesMapController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesMapController],
    }).compile();

    controller = module.get<SalesMapController>(SalesMapController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
