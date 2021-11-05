"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
let SearchService = class SearchService {
    searchModelFromQueryParams(model, queryParams, options = {}) {
        const searchParams = this.searchParamsFromQueryParams(queryParams);
        return this.searchModel(model, searchParams, options);
    }
    searchModel(model, searchParams = {}, options = {}) {
        if (!searchParams.page)
            searchParams.page = 1;
        if (!searchParams.size)
            searchParams.size = 10;
        const end = searchParams.page * searchParams.size;
        const start = end - searchParams.size;
        let filterQuery = {};
        // If filterQueryPromise is defined, use that as filterQuery, otherwise use the default filters
        let filterQueryPromise = Promise.resolve({});
        if (options.filterFunction) {
            filterQueryPromise = options.filterFunction(searchParams).then(fq => filterQuery = fq);
        }
        else {
            if (searchParams.filter) {
                Object.keys(searchParams.filter).forEach(key => {
                    const value = searchParams.filter[key];
                    if (value && value !== 'null') {
                        filterQuery[key] = this.regexMatch(value);
                    }
                });
            }
        }
        return filterQueryPromise.then(() => {
            let sort = this.toSearchString(searchParams.sort);
            // console.log('searchModel: sort=%o', sort);
            const query = model.find(filterQuery).sort({ active: -1 }).sort(sort).skip(start).limit(searchParams.size);
            if (options.select)
                query.select(options.select);
            if (options.populates)
                options.populates.forEach(p => query.populate(p));
            if (options.lean)
                query.lean(); // Disabled to make sure virtuals get populated
            return Promise.all([
                model.countDocuments(filterQuery).exec(),
                query.exec()
            ]).then(([total, data]) => this.createSearchResult(searchParams, total, data));
        });
    }
    searchParamsFromQueryParams(queryParams) {
        const searchParams = {
            size: +queryParams.size || 10,
            page: +queryParams.page || 1,
            filter: {}
        };
        Object.keys(queryParams).forEach(key => {
            let filterMatch = key.match(/^filter\.(.*)/);
            let value = queryParams[key];
            if (value === 'null')
                return;
            if (filterMatch)
                searchParams.filter[filterMatch[1]] = value;
            if (key === 'sort') {
                searchParams.sort = this.fromSortString(value);
            }
        });
        // console.log('searchParamsFromQueryParams: searchParams=%o', searchParams);
        return searchParams;
    }
    toSearchString(sort) {
        if (!sort)
            return '';
        return (sort.dir === -1 ? '-' : '') + sort.prop;
    }
    fromSortString(str) {
        // console.log('fromSortString: str=%o', str);
        const sort = { dir: 1, prop: '' };
        if (str[0] === '-') {
            sort.dir = -1;
            str = str.slice(1);
        }
        sort.prop = str;
        return sort;
    }
    createSearchResult(params, total, records) {
        return {
            page: params.page,
            size: params.size,
            total: total,
            records: records
        };
    }
    regexMatch(value) {
        return new RegExp(this.escapeRegex(value), 'gi');
    }
    escapeRegex(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }
};
SearchService = __decorate([
    (0, common_1.Injectable)()
], SearchService);
exports.SearchService = SearchService;
//# sourceMappingURL=search.service.js.map