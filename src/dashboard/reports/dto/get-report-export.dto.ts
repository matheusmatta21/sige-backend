import { GetGamesDTO } from '../../../games/dto/get-games.dto.js';

export class GetReportExportDTO {
  title: string;
  total_titles: number;
  global_sales: number;
  critic_average_score: number;
  user_average_score: number;
  sales_by_region: {
    na_sales: number;
    eu_sales: number;
    jp_sales: number;
    other_sales: number;
  };
  top_platforms: {
    platform_name: string;
    global_sales: number;
  }[];
  top_genres: {
    genre_name: string;
    global_sales: number;
  }[];
  games: GetGamesDTO[];
}
