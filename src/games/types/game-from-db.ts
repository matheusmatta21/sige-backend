import { Prisma } from "../../generated/prisma/client.js";

export type GameFromDb = {
  name: string;
  year_of_release: number | null;
  dim_platforms: { name: string } | null;
  dim_genres: { name: string } | null;
  dim_publishers: { name: string } | null;
  dim_ratings: { name: string } | null;
  na_sales: Prisma.Decimal | null;
  eu_sales: Prisma.Decimal | null;
  jp_sales: Prisma.Decimal | null;
  other_sales: Prisma.Decimal | null;
  global_sales: Prisma.Decimal | null;
  critic_score: number | null;
  critic_count: number | null;
  user_score: number | null;
  user_count: number | null;
};
