import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('rankings')
export class RankingsController {}
