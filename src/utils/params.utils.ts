import { SortOrder } from 'mongoose';

export const isAllowedParams = <T extends readonly string[]>(value: string, allowedValues: T): value is T[number] => {
  return allowedValues.includes(value as T[number]);
};

export const buildAllowedFilters = <T extends string>(allowedFilters: readonly T[], filter: Record<string, any>): Partial<Record<T, any>> => {
  return Object.entries(filter).reduce((acc, [key, value]) => {
    if (allowedFilters.includes(key as T) && value !== undefined && value !== null && value !== '') {
      acc[key as T] = value;
    }

    return acc;
  }, {} as Partial<Record<T, any>>);
};

export const buildAllowedFields = <T extends string>(allowedFields: readonly T[], fields?: (string | number | symbol)[]): Partial<Record<T | '_id', 1>> => {
  if (!fields || fields.length === 0) {
    return allowedFields.reduce(
      (acc, field) => {
        acc[field] = 1;
        return acc;
      },
      { _id: 1 } as Partial<Record<T | '_id', 1>>
    );
  }

  return fields.reduce(
    (acc, field) => {
      if (field && allowedFields.includes(field as T)) {
        acc[field as T] = 1;
      }

      return acc;
    },
    { _id: 1 } as Partial<Record<T | '_id', 1>>
  );
};

export const buildAllowedSort = <K extends string>(allowedSorts: readonly K[], sortParams?: readonly string[]): [string, SortOrder][] => {
  if (!sortParams || sortParams.length === 0) return [];

  return sortParams.reduce<[string, SortOrder][]>((acc, sort) => {
    if (!sort) return acc;

    let field: string;
    let order: SortOrder;

    if (sort.startsWith('-')) {
      field = sort.slice(1);
      order = -1;
    } else {
      field = sort;
      order = 1;
    }

    if (allowedSorts.includes(field as K)) {
      acc.push([field, order]);
    }

    return acc;
  }, []);
};

export const buildPagination = (baseUrl: string, total: number, limit: number, offset: number, originalQuery: Record<string, any> = {}): { nextUrl: string | null; previousUrl: string | null } => {
  const nextOffset = offset + limit;
  const previousOffset = Math.max(offset - limit, 0);

  const buildUrl = (newOffset: number): string => {
    const params = new URLSearchParams(originalQuery);

    params.set('limit', limit.toString());
    params.set('offset', newOffset.toString());

    return `${baseUrl}?${params.toString()}`;
  };

  const nextUrl = nextOffset < total ? buildUrl(nextOffset) : null;
  const previousUrl = offset > 0 ? buildUrl(previousOffset) : null;

  return { nextUrl, previousUrl };
};
