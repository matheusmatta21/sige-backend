export type RegionKey = 'na' | 'eu' | 'jp' | 'other';

export interface GameRow {
  id: number;
  name: string;
  year_of_release: number | null;
  platform_name: string | null;
  genre_name: string | null;
  publisher_name: string | null;
  rating: string | null;
  na_sales: number;
  eu_sales: number;
  jp_sales: number;
  other_sales: number;
  global_sales: number;
  critic_score: number | null;
  critic_count: number | null;
  user_score: number | null;
  user_count: number | null;
}

export interface GamesResponse {
  data: GameRow[];
  total: number;
}

export interface GlobalSalesResponse {
  global_sales: number;
}

export interface TopGenreResponse {
  genre_name: string;
  global_sales: number;
}

export interface AverageScoresResponse {
  userAverageScore: number;
  criticAverageScore: number;
}

export interface SalesByRegionResponse {
  na: { na_sales: number; na_percentage: number };
  eu: { eu_sales: number; eu_percentage: number };
  jp: { jp_sales: number; jp_percentage: number };
  other: { other_sales: number; other_percentage: number };
}

export interface TopPlatformItem {
  platform_name: string;
  global_sales: number;
}

export interface SalesByYearItem {
  year_of_release: number;
  na_sales: number;
  eu_sales: number;
  jp_sales: number;
  other_sales: number;
  global_sales: number;
}

export interface SalesRankingItem {
  name: string;
  na_sales: number;
  eu_sales: number;
  jp_sales: number;
  other_sales: number;
  global_sales: number;
}

export interface PublisherAnalyticsItem {
  name: string;
  titles: number;
  global_sales: number;
  critic_average_score: number | null;
  user_average_score: number | null;
}

export interface GenreRegionSalesItem {
  genre_name: string;
  sales: {
    na_sales: number;
    eu_sales: number;
    jp_sales: number;
    other_sales: number;
    global_sales: number;
  };
}

export interface GameDetailsResponse {
  name: string;
  platforms: { platform_name: string }[];
  genre_name: string | null;
  publisher_name: string | null;
  rating: string | null;
  year_of_release: number | null;
  critic_score: number | null;
  critic_count: number | null;
  average_genre_critic_score: number | null;
  diff_critic_score_percentage: number;
  user_score: number | null;
  user_count: number | null;
  average_genre_user_score: number | null;
  diff_user_score_percentage: number;
  na_sales: number;
  na_sales_percentage: number;
  eu_sales_percentage: number;
  jp_sales_percentage: number;
  other_sales_percentage: number;
  eu_sales: number;
  jp_sales: number;
  global_sales: number;
  average_genre_global_sales: number;
  diff_global_sales_percentage: number;
  other_sales: number;
}

export interface ReportPreviewResponse {
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
  games: GameRow[];
}
