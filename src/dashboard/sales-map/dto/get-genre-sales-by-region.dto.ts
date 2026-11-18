export class GetGenreSalesByRegionDTO {
  genre_name: string;
  sales: {
    na_sales: number;
    eu_sales: number;
    jp_sales: number;
    global_sales: number;
    other_sales: number;
  };
}
