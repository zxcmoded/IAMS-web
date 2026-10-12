import { HttpParams } from '@angular/common/http';
import { ListQuery } from '../models/api.model';

/**
 * Builds the common admin-list query params shared by every list endpoint.
 * Maps the UI's 0-based `pageIndex` to the API's 1-based `page`, and includes
 * the optional `companyId` / `parentCode` parent filters when present.
 */
export function buildListParams(query: ListQuery): HttpParams {
  let params = new HttpParams()
    .set('page', String((query.pageIndex ?? 0) + 1))
    .set('pageSize', String(query.pageSize ?? 25));

  if (query.search) {
    params = params.set('search', query.search);
  }
  if (query.includeInactive) {
    params = params.set('includeInactive', 'true');
  }
  if (query.companyId) {
    params = params.set('companyId', query.companyId);
  }
  if (query.parentCode) {
    params = params.set('parentCode', query.parentCode);
  }
  return params;
}
