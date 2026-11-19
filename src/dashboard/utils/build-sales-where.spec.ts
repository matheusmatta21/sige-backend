import { BadRequestException } from '@nestjs/common';
import { buildSalesWhere } from './build-sales-where.js';

describe('buildSalesWhere', () => {
  it('returns empty object when no filters and no baseWhere are passed', () => {
    expect(buildSalesWhere({})).toEqual({});
  });

  it('returns baseWhere directly when filters are empty or blank strings', () => {
    const baseWhere = { year_of_release: { not: null } };
    expect(
      buildSalesWhere(
        { publisher: '', genre: '   ', yearFrom: '', criticMin: undefined },
        baseWhere,
      ),
    ).toEqual(baseWhere);
  });

  it('builds dimension in-filters and numeric intervals from strings or arrays', () => {
    expect(
      buildSalesWhere({
        publisher: 'Nintendo, Ubisoft',
        genre: ['Sports', 'Action'],
        platform: 'Wii',
        rating: 'E',
        yearFrom: '2006',
        yearTo: 2015,
        criticMin: '70',
        criticMax: 95,
      }),
    ).toEqual({
      dim_publishers: { name: { in: ['Nintendo', 'Ubisoft'] } },
      dim_genres: { name: { in: ['Sports', 'Action'] } },
      dim_platforms: { name: { in: ['Wii'] } },
      dim_ratings: { name: { in: ['E'] } },
      year_of_release: { gte: 2006, lte: 2015 },
      critic_score: { gte: 70, lte: 95 },
    });
  });

  it('combines baseWhere and filterWhere using AND without overwriting base constraints', () => {
    expect(
      buildSalesWhere(
        { yearFrom: 2006, yearTo: 2010 },
        { year_of_release: { not: null } },
      ),
    ).toEqual({
      AND: [
        { year_of_release: { not: null } },
        { year_of_release: { gte: 2006, lte: 2010 } },
      ],
    });
  });

  it('throws BadRequestException for non-numeric interval values', () => {
    expect(() => buildSalesWhere({ yearFrom: 'abc' })).toThrow(
      BadRequestException,
    );
    expect(() => buildSalesWhere({ criticMax: 'nope' })).toThrow(
      BadRequestException,
    );
  });
});
