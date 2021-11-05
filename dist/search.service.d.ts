import { Model, Document } from 'mongoose';
import { SearchParams, SearchResult, SearchOptions } from './search.interface';
export { SearchParams, SearchResult, SearchOptions };
export declare class SearchService {
    searchModelFromQueryParams<T extends Document>(model: Model<T>, queryParams: object, options?: SearchOptions): Promise<SearchResult<T>>;
    searchModel<T extends Document>(model: Model<T>, searchParams?: SearchParams, options?: SearchOptions): Promise<SearchResult<T>>;
    searchParamsFromQueryParams(queryParams: any): SearchParams;
    private toSearchString;
    private fromSortString;
    private createSearchResult;
    regexMatch(value: string): RegExp;
    private escapeRegex;
}
//# sourceMappingURL=search.service.d.ts.map