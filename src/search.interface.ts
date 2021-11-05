export interface SearchSort {
	prop: string;
	dir: number;		// 1 / -1
}

interface FilterObject {
	[key:string]: any
};

export interface SearchParams {
	page?: number;
	size?: number;
	filter?: FilterObject;
	sort?: SearchSort;
};

interface FilterFunction {
	(params):Promise<any>
};

export interface Populate {
	path: string,
	select?: string,
	populate?: Populate
};

export interface SearchOptions {
	select?: string;
	populates?: Populate[];
	filterFunction?: FilterFunction;
	lean?: boolean;
};

export interface SearchResult<T> {
	page: number;		// Current page (1-indexed)
	size: number;		// Page size
	total: number;		// Total data items
	records: T[];
};
