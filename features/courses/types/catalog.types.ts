
export type Filters = {
    categories: string[];
    levels: string[];
    durations: string[];
    prices: string[];
    rating: number;
    certificate: boolean;
};

export type FilterKey =
    | "categories"
    | "levels"
    | "durations"
    | "prices";

export type FilterOption = {
    label: string;
    count?: number;
};

export type FilterGroupConfig = {
    title: string;
    key: FilterKey;
    options: FilterOption[];
};

export const initialFilters: Filters = {
    categories: [],
    levels: [],
    durations: [],
    prices: [],
    rating: 0,
    certificate: false,
};

export const PAGE_SIZE = 6;
