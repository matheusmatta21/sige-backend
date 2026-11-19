export class GamePlatformChipDTO {
  platform_name: string;
}

export class GetGameDetailsDTO {
  name: string;
  platforms: GamePlatformChipDTO[];
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
