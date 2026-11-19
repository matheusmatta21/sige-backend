import { Injectable, StreamableFile } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GetReportExportDTO } from './dto/get-report-export.dto.js';

export enum ReportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReportData(
    publisher?: string,
    genre?: string,
    platform?: string,
    rating?: string,
    yearFrom?: number,
    yearTo?: number,
    criticMin?: number,
    criticMax?: number,
    limit?: number,
    title = 'Relatório de vendas globais',
    _includeKpis = true,
    _includeRegions = true,
    includePlatforms = true,
    includeGenres = true,
    includeGames = true,
  ): Promise<GetReportExportDTO> {
    const where = {
      ...(publisher?.trim()
        ? { dim_publishers: { name: publisher.trim() } }
        : {}),
      ...(genre?.trim() ? { dim_genres: { name: genre.trim() } } : {}),
      ...(platform?.trim()
        ? { dim_platforms: { name: platform.trim() } }
        : {}),
      ...(rating?.trim() ? { dim_ratings: { name: rating.trim() } } : {}),
      year_of_release: {
        gte: yearFrom,
        lte: yearTo,
      },
      critic_score: {
        gte: criticMin,
        lte: criticMax,
      },
    };

    const summary = await this.prisma.fact_game_sales.aggregate({
      where,
      _sum: {
        global_sales: true,
        na_sales: true,
        eu_sales: true,
        jp_sales: true,
        other_sales: true,
      },
      _avg: {
        critic_score: true,
        user_score: true,
      },
      _count: {
        id: true,
      },
    });

    const topPlatforms = includePlatforms
      ? await (async () => {
          const platformGroup = await this.prisma.fact_game_sales.groupBy({
            by: 'platform_id',
            where: { ...where, platform_id: { not: null } },
            _sum: {
              global_sales: true,
            },
            orderBy: { _sum: { global_sales: 'desc' } },
            take: 5,
          });

          const platforms = await this.prisma.dim_platforms.findMany({
            select: { id: true, name: true },
          });
          const platformNameMap = new Map(
            platforms.map((item) => [item.id, item.name]),
          );

          return platformGroup.map((item) => ({
            platform_name:
              platformNameMap.get(item.platform_id as number) ?? 'Desconhecido',
            global_sales: Number(item._sum.global_sales ?? 0),
          }));
        })()
      : [];

    const topGenres = includeGenres
      ? await (async () => {
          const genreGroup = await this.prisma.fact_game_sales.groupBy({
            by: 'genre_id',
            where: { ...where, genre_id: { not: null } },
            _sum: {
              global_sales: true,
            },
            orderBy: { _sum: { global_sales: 'desc' } },
            take: 5,
          });

          const genres = await this.prisma.dim_genres.findMany({
            select: { id: true, name: true },
          });
          const genreNameMap = new Map(
            genres.map((item) => [item.id, item.name]),
          );

          return genreGroup.map((item) => ({
            genre_name:
              genreNameMap.get(item.genre_id as number) ?? 'Desconhecido',
            global_sales: Number(item._sum.global_sales ?? 0),
          }));
        })()
      : [];

    const games = includeGames
      ? await this.prisma.fact_game_sales.findMany({
          where,
          select: {
            id: true,
            name: true,
            year_of_release: true,
            dim_platforms: { select: { name: true } },
            dim_genres: { select: { name: true } },
            dim_publishers: { select: { name: true } },
            dim_ratings: { select: { name: true } },
            na_sales: true,
            eu_sales: true,
            jp_sales: true,
            other_sales: true,
            global_sales: true,
            critic_score: true,
            critic_count: true,
            user_score: true,
            user_count: true,
          },
          orderBy: { global_sales: { sort: 'desc', nulls: 'last' } },
          take: limit && limit > 0 ? limit : 10,
        })
      : [];

    return {
      title: title.trim() || 'Relatório de vendas globais',
      total_titles: summary._count.id,
      global_sales: Number(summary._sum.global_sales ?? 0),
      critic_average_score: Number((summary._avg.critic_score ?? 0).toFixed(2)),
      user_average_score: Number((summary._avg.user_score ?? 0).toFixed(2)),
      sales_by_region: {
        na_sales: Number(summary._sum.na_sales ?? 0),
        eu_sales: Number(summary._sum.eu_sales ?? 0),
        jp_sales: Number(summary._sum.jp_sales ?? 0),
        other_sales: Number(summary._sum.other_sales ?? 0),
      },
      top_platforms: topPlatforms,
      top_genres: topGenres,
      games: games.map((game) => ({
        id: game.id,
        name: game.name,
        year_of_release: game.year_of_release,
        platform_name: game.dim_platforms?.name ?? null,
        genre_name: game.dim_genres?.name ?? null,
        publisher_name: game.dim_publishers?.name ?? null,
        rating: game.dim_ratings?.name ?? null,
        na_sales: Number(game.na_sales ?? 0),
        eu_sales: Number(game.eu_sales ?? 0),
        jp_sales: Number(game.jp_sales ?? 0),
        other_sales: Number(game.other_sales ?? 0),
        global_sales: Number(game.global_sales ?? 0),
        critic_score: game.critic_score,
        critic_count: game.critic_count,
        user_score: game.user_score,
        user_count: game.user_count,
      })),
    };
  }

  async exportReport(
    format: string,
    publisher?: string,
    genre?: string,
    platform?: string,
    rating?: string,
    yearFrom?: number,
    yearTo?: number,
    criticMin?: number,
    criticMax?: number,
    limit?: number,
    title = 'Relatório de vendas globais',
    includeKpis = true,
    includeRegions = true,
    includePlatforms = true,
    includeGenres = true,
    includeGames = true,
  ): Promise<StreamableFile> {
    const report = await this.getReportData(
      publisher,
      genre,
      platform,
      rating,
      yearFrom,
      yearTo,
      criticMin,
      criticMax,
      limit,
      title,
      includeKpis,
      includeRegions,
      includePlatforms,
      includeGenres,
      includeGames,
    );

    switch (format) {
      case ReportFormat.PDF: {
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          const doc = new PDFDocument({ size: 'A4', margin: 0 });
          const chunks: Buffer[] = [];

          doc.on('data', (chunk: Buffer) => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          const fmt = (n: number) => n.toFixed(2).replace('.', ',');

          const drawCardPage = () => {
            doc.rect(0, 0, 595.28, 841.89).fill('#16201d');
            doc
              .roundedRect(24, 24, 547, 794, 8)
              .fillAndStroke('#3b4044', '#4f555a');
          };

          drawCardPage();

          doc
            .font('Helvetica-Bold')
            .fontSize(15)
            .fillColor('#ffffff')
            .text(report.title, 44, 42, {
              width: 507,
              ellipsis: true,
              lineBreak: false,
            });

          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#a0a7ac')
            .text(
              `${report.total_titles} títulos · gerado em ${new Date().toLocaleDateString('pt-BR')}`,
              44,
              63,
              { lineBreak: false },
            );

          let currentY = 88;

          if (includeKpis) {
            const kpis = [
              {
                label: 'UNIDADES GLOBAIS',
                value: `${fmt(report.global_sales)} M un.`,
              },
              { label: 'TÍTULOS', value: String(report.total_titles) },
              {
                label: 'MÉDIA CRÍTICA',
                value: fmt(report.critic_average_score),
              },
              {
                label: 'MÉDIA USUÁRIO',
                value: fmt(report.user_average_score),
              },
            ];

            kpis.forEach((kpi, index) => {
              const cardX = 44 + index * (118.5 + 11);
              doc
                .roundedRect(cardX, currentY, 118.5, 50, 4)
                .fillAndStroke('#363b3f', '#555b60');
              doc
                .font('Helvetica')
                .fontSize(7)
                .fillColor('#a0a7ac')
                .text(kpi.label, cardX + 10, currentY + 9, {
                  width: 98.5,
                  lineBreak: false,
                });
              doc
                .font('Helvetica-Bold')
                .fontSize(13)
                .fillColor('#ffffff')
                .text(kpi.value, cardX + 10, currentY + 24, {
                  width: 98.5,
                  lineBreak: false,
                });
            });

            currentY += 66;
          }

          if (includeRegions) {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#a0a7ac')
              .text('VENDAS POR REGIÃO', 44, currentY, { lineBreak: false });

            const regionRows = [
              {
                label: 'América do Norte',
                value: report.sales_by_region.na_sales,
                color: '#1b76c4',
              },
              {
                label: 'Europa',
                value: report.sales_by_region.eu_sales,
                color: '#4d279a',
              },
              {
                label: 'Japão',
                value: report.sales_by_region.jp_sales,
                color: '#9e1b16',
              },
              {
                label: 'Outros',
                value: report.sales_by_region.other_sales,
                color: '#8d6728',
              },
            ];
            const maxRegionBase =
              report.global_sales > 0 ? report.global_sales : 1;

            regionRows.forEach((row, index) => {
              const y = currentY + 18 + index * 20;
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#e5e7eb')
                .text(row.label, 44, y, { width: 95, lineBreak: false });
              doc.roundedRect(145, y + 2, 315, 7, 3).fill('#262a2e');
              if (row.value > 0) {
                const barWidth = Math.min(
                  315,
                  Math.max(4, (row.value / maxRegionBase) * 315),
                );
                doc.roundedRect(145, y + 2, barWidth, 7, 3).fill(row.color);
              }
              doc
                .font('Helvetica-Bold')
                .fontSize(9)
                .fillColor('#e5e7eb')
                .text(`${fmt(row.value)} M un.`, 468, y, {
                  width: 83,
                  align: 'right',
                  lineBreak: false,
                });
            });

            currentY += 108;
          }

          if (includePlatforms) {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#a0a7ac')
              .text('TOP 5 PLATAFORMAS', 44, currentY, { lineBreak: false });

            const maxPlatformSales = Math.max(
              ...report.top_platforms.map((item) => item.global_sales),
              1,
            );

            report.top_platforms.forEach((item, index) => {
              const y = currentY + 18 + index * 20;
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#e5e7eb')
                .text(item.platform_name, 44, y, {
                  width: 95,
                  ellipsis: true,
                  lineBreak: false,
                });
              doc.roundedRect(145, y + 2, 315, 7, 3).fill('#262a2e');
              if (item.global_sales > 0) {
                const barWidth = Math.min(
                  315,
                  Math.max(4, (item.global_sales / maxPlatformSales) * 315),
                );
                doc.roundedRect(145, y + 2, barWidth, 7, 3).fill('#0c8c42');
              }
              doc
                .font('Helvetica-Bold')
                .fontSize(9)
                .fillColor('#e5e7eb')
                .text(`${fmt(item.global_sales)} M un.`, 468, y, {
                  width: 83,
                  align: 'right',
                  lineBreak: false,
                });
            });

            currentY += 28 + report.top_platforms.length * 20;
          }

          if (includeGenres) {
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#a0a7ac')
              .text('TOP 5 GÊNEROS', 44, currentY, { lineBreak: false });

            const maxGenreSales = Math.max(
              ...report.top_genres.map((item) => item.global_sales),
              1,
            );

            report.top_genres.forEach((item, index) => {
              const y = currentY + 18 + index * 20;
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#e5e7eb')
                .text(item.genre_name, 44, y, {
                  width: 95,
                  ellipsis: true,
                  lineBreak: false,
                });
              doc.roundedRect(145, y + 2, 315, 7, 3).fill('#262a2e');
              if (item.global_sales > 0) {
                const barWidth = Math.min(
                  315,
                  Math.max(4, (item.global_sales / maxGenreSales) * 315),
                );
                doc.roundedRect(145, y + 2, barWidth, 7, 3).fill('#0c8c42');
              }
              doc
                .font('Helvetica-Bold')
                .fontSize(9)
                .fillColor('#e5e7eb')
                .text(`${fmt(item.global_sales)} M un.`, 468, y, {
                  width: 83,
                  align: 'right',
                  lineBreak: false,
                });
            });

            currentY += 28 + report.top_genres.length * 20;
          }

          if (includeGames) {
            const drawTableHeader = (headerY: number) => {
              doc
                .font('Helvetica')
                .fontSize(7.5)
                .fillColor('#a0a7ac')
                .text('JOGO', 44, headerY, { width: 190, lineBreak: false })
                .text('PLATAFORMA', 240, headerY, {
                  width: 75,
                  lineBreak: false,
                })
                .text('ANO', 320, headerY, { width: 45, lineBreak: false })
                .text('GLOBAL', 375, headerY, {
                  width: 95,
                  align: 'right',
                  lineBreak: false,
                })
                .text('CRÍTICA', 480, headerY, {
                  width: 71,
                  align: 'right',
                  lineBreak: false,
                });

              doc
                .moveTo(44, headerY + 14)
                .lineTo(551, headerY + 14)
                .lineWidth(0.5)
                .stroke('#4b5156');
            };

            if (currentY > 730) {
              doc.addPage({ size: 'A4', margin: 0 });
              drawCardPage();
              currentY = 44;
            }

            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#a0a7ac')
              .text(
                `JOGOS (${report.games.length} DE ${report.total_titles})`,
                44,
                currentY,
                { lineBreak: false },
              );

            drawTableHeader(currentY + 20);

            let rowY = currentY + 42;
            for (const game of report.games) {
              if (rowY > 775) {
                doc.addPage({ size: 'A4', margin: 0 });
                drawCardPage();
                drawTableHeader(44);
                rowY = 66;
              }

              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor('#e5e7eb')
                .text(game.name, 44, rowY, {
                  width: 190,
                  ellipsis: true,
                  lineBreak: false,
                })
                .text(game.platform_name ?? '-', 240, rowY, {
                  width: 75,
                  ellipsis: true,
                  lineBreak: false,
                })
                .text(
                  game.year_of_release !== null
                    ? String(game.year_of_release)
                    : '-',
                  320,
                  rowY,
                  { width: 45, lineBreak: false },
                )
                .text(`${fmt(game.global_sales)} M un.`, 375, rowY, {
                  width: 95,
                  align: 'right',
                  lineBreak: false,
                })
                .text(
                  game.critic_score !== null ? String(game.critic_score) : '-',
                  480,
                  rowY,
                  { width: 71, align: 'right', lineBreak: false },
                );

              doc
                .moveTo(44, rowY + 16)
                .lineTo(551, rowY + 16)
                .lineWidth(0.5)
                .stroke('#4b5156');

              rowY += 22;
            }
          }

          doc.end();
        });

        return new StreamableFile(pdfBuffer, {
          type: 'application/pdf',
          disposition: 'attachment; filename="relatorio-vendas.pdf"',
        });
      }

      case ReportFormat.CSV:
      default: {
        const escapeCsv = (value: string | number | null | undefined) => {
          const text = value === null || value === undefined ? '' : String(value);
          return `"${text.replace(/"/g, '""')}"`;
        };

        const header =
          'ID,Nome,Plataforma,Ano,Genero,Publicadora,Classificacao,Vendas NA,Vendas EU,Vendas JP,Outras Vendas,Vendas Globais,Nota Critica,Nota Usuario';

        const rows = report.games.map((game) =>
          [
            game.id,
            escapeCsv(game.name),
            escapeCsv(game.platform_name),
            game.year_of_release ?? '',
            escapeCsv(game.genre_name),
            escapeCsv(game.publisher_name),
            escapeCsv(game.rating),
            game.na_sales,
            game.eu_sales,
            game.jp_sales,
            game.other_sales,
            game.global_sales,
            game.critic_score ?? '',
            game.user_score ?? '',
          ].join(','),
        );

        const csvContent = [header, ...rows].join('\n');

        return new StreamableFile(Buffer.from('\uFEFF' + csvContent, 'utf-8'), {
          type: 'text/csv; charset=utf-8',
          disposition: 'attachment; filename="relatorio-vendas.csv"',
        });
      }
    }
  }
}
