export interface SearchSort {
    prop: string;
    dir: number;
}
interface FilterObject {
    [key: string]: any;
}
export interface SearchParams {
    page?: number;
    size?: number;
    filter?: FilterObject;
    sort?: SearchSort;
}
interface FilterFunction {
    (params: any): Promise<any>;
}
export interface Populate {
    path: string;
    select?: string;
    populate?: Populate;
}
export interface SearchOptions {
    select?: string;
    populates?: Populate[];
    filterFunction?: FilterFunction;
    lean?: boolean;
}
export interface SearchResult<T> {
    page: number;
    size: number;
    total: number;
    records: T[];
}
export {};
//# sourceMappingURL=search.interface.d.ts.map