import { Injectable } from '@nestjs/common';
import { Model, Document } from 'mongoose';
import { SearchParams, SearchResult, SearchOptions, SearchSort }	from './search.interface';
export {SearchParams, SearchResult, SearchOptions};

@Injectable()
export class SearchService {

	searchModelFromQueryParams<T extends Document>(model:Model<T>, queryParams:object, options:SearchOptions={}):Promise<SearchResult<T>> {
		const searchParams = this.searchParamsFromQueryParams(queryParams);
		return this.searchModel<T>(model, searchParams, options);
	}


	searchModel<T extends Document>(model:Model<T>, searchParams:SearchParams={}, options:SearchOptions={}):Promise<SearchResult<T>> {
		if(!searchParams.page) searchParams.page=1;
		if(!searchParams.size) searchParams.size=10;
		const end = searchParams.page*searchParams.size;
		const start = end-searchParams.size;
		let filterQuery:any = {};

		// If filterQueryPromise is defined, use that as filterQuery, otherwise use the default filters
		let filterQueryPromise = Promise.resolve({});
		if(options.filterFunction) {
			filterQueryPromise = options.filterFunction(searchParams).then(fq => filterQuery=fq);
		} else {
			if(searchParams.filter) {
				Object.keys(searchParams.filter).forEach(key => {
					const value = searchParams.filter[key];
					if(value && value!=='null') {
						filterQuery[key] = this.regexMatch(value);
					}
				});
			}
		}
		return filterQueryPromise.then(() => {
			let sort = this.toSearchString(searchParams.sort);
			// console.log('searchModel: sort=%o', sort);
			const query = model.find(filterQuery).sort({active:-1}).sort(sort).skip(start).limit(searchParams.size);
			if(options.select) query.select(options.select);
			if(options.populates) options.populates.forEach(p => query.populate(p));
			if(options.lean) query.lean();		// Disabled to make sure virtuals get populated

			return Promise.all([
				model.countDocuments(filterQuery).exec(),
				query.exec()
			]).then(([total,data]) => this.createSearchResult<T>(searchParams,total,data));
		});
	}

	searchParamsFromQueryParams(queryParams:any):SearchParams {
		const searchParams = <SearchParams>{
			size: +queryParams.size || 10,
			page: +queryParams.page || 1,
			filter: {}
		};
		Object.keys(queryParams).forEach(key => {
			let filterMatch = key.match(/^filter\.(.*)/);
			let value = queryParams[key];
			if(value==='null') return;
			if(filterMatch) searchParams.filter[filterMatch[1]] = value;
			if(key==='sort') {
				searchParams.sort = this.fromSortString(value);
			}
		});
		// console.log('searchParamsFromQueryParams: searchParams=%o', searchParams);
		return searchParams;
	}

	private toSearchString(sort:SearchSort):string {
		if(!sort) return '';
		return (sort.dir===-1 ? '-':'') + sort.prop;
	}
	private fromSortString(str:string):SearchSort {
		// console.log('fromSortString: str=%o', str);
		const sort = {dir:1, prop:''};
		if(str[0]==='-') {
			sort.dir = -1;
			str = str.slice(1);
		}
		sort.prop = str;
		return sort;
	}

	private createSearchResult<T extends Document>(params:SearchParams, total:number, records:T[]):SearchResult<T> {
		return {
			page: params.page,
			size: params.size,
			total: total,
			records: records
		};
	}


	regexMatch(value:string):RegExp {
		return new RegExp(this.escapeRegex(value), 'gi');
	}

	private escapeRegex(str:string):string {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	}
}
