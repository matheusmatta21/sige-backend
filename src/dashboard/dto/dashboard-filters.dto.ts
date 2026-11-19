import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardFiltersDTO {
  @ApiPropertyOptional({
    description: 'Filtrar por uma ou mais publicadoras (separadas por vírgula ou repetidas)',
    example: 'Nintendo',
  })
  publisher?: string | string[];

  @ApiPropertyOptional({
    description: 'Filtrar por um ou mais gêneros (separados por vírgula ou repetidos)',
    example: 'Sports',
  })
  genre?: string | string[];

  @ApiPropertyOptional({
    description: 'Filtrar por uma ou mais plataformas (separadas por vírgula ou repetidas)',
    example: 'Wii',
  })
  platform?: string | string[];

  @ApiPropertyOptional({
    description: 'Filtrar por uma ou mais classificações ESRB',
    example: 'E',
  })
  rating?: string | string[];

  @ApiPropertyOptional({ type: Number, example: 2006 })
  yearFrom?: number | string;

  @ApiPropertyOptional({ type: Number, example: 2015 })
  yearTo?: number | string;

  @ApiPropertyOptional({ type: Number, example: 70 })
  criticMin?: number | string;

  @ApiPropertyOptional({ type: Number, example: 100 })
  criticMax?: number | string;
}
