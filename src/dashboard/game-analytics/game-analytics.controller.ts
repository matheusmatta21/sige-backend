import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('game-analytics')
export class GameAnalyticsController {}
