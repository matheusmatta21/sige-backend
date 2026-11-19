import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GetGenreSalesByRegionDTO } from './dto/get-genre-sales-by-region.dto.js';
import { DashboardFiltersDTO } from '../dto/dashboard-filters.dto.js';
import { buildSalesWhere } from '../utils/build-sales-where.js';

@Injectable()
export class SalesMapService {
  constructor(private readonly prisma: PrismaService) {}

  async getGenreSalesByRegion(
    filters: DashboardFiltersDTO = {},
  ): Promise<GetGenreSalesByRegionDTO[]> {
    const genreSales = await this.prisma.fact_game_sales.groupBy({
      by: ['genre_id'],
      _sum: {
        na_sales: true,
        eu_sales: true,
        jp_sales: true,
        global_sales: true,
        other_sales: true,
      },
      where: buildSalesWhere(filters),
    });

    const genres = await this.prisma.dim_genres.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const genreSalesArray = [];

    for (const items of genreSales) {
      for (const genre of genres) {
        const finalObject = {
          genre_name: '',
          sales: {
            na_sales: 0,
            eu_sales: 0,
            jp_sales: 0,
            global_sales: 0,
            other_sales: 0,
          },
        };
        if (genre.id === items.genre_id) {
          finalObject.genre_name = genre.name;
          finalObject.sales.na_sales = Number(items._sum.na_sales);
          finalObject.sales.eu_sales = Number(items._sum.eu_sales);
          finalObject.sales.jp_sales = Number(items._sum.jp_sales);
          finalObject.sales.global_sales = Number(items._sum.global_sales);
          finalObject.sales.other_sales = Number(items._sum.other_sales);
          genreSalesArray.push(finalObject);
        }
      }
    }

    return genreSalesArray.sort((a, b) => b.sales.global_sales - a.sales.global_sales);
  }
}
