import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('sales-map')
export class SalesMapController {}
