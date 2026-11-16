export class GetGamesDTO {
    name: string
    year_of_release: number | null
    platform_name: string | null
    genre_name: string | null
    publisher_name: string | null
    rating: string | null
    na_sales: number
    eu_sales: number
    jp_sales: number
    other_sales: number
    global_sales: number
    critic_score: number | null
    critic_count: number | null
    user_score: number | null
    user_count: number | null
}