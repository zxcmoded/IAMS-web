import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { buildListParams } from '../../core/api/list-params.util';
import { Company } from '../../core/models/entities.model';
import { AdminPage, ListQuery } from '../../core/models/api.model';

/**
 * Typed gateway for Company CRUD — the ONLY place that knows the Company wire
 * shape and query-param names. Effects call these typed methods.
 *
 * Contract notes:
 *  - List envelope is {@link AdminPage}; query `page` is 1-based so we map
 *    `page = pageIndex + 1` here.
 *  - Create/Update bodies carry `{ name }` only (companyId is server-assigned
 *    and immutable).
 *  - Create/Delete are SuperAdmin-only server-side (403 otherwise); the UI also
 *    gates these, but the effect still surfaces a 403 gracefully.
 */

/** Payload sent on create (no id — companyId is server-generated). */
export type CompanyCreate = Pick<Company, 'name'>;
/** Payload sent on update (companyId identifies the row; it is not renamed). */
export type CompanyUpdate = Pick<Company, 'name'>;

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery): Observable<AdminPage<Company>> {
    return this.http.get<AdminPage<Company>>(ApiEndpoints.company.list(), {
      params: buildListParams(query),
    });
  }

  getById(id: string): Observable<Company> {
    return this.http.get<Company>(ApiEndpoints.company.byId(id));
  }

  create(payload: CompanyCreate): Observable<Company> {
    return this.http.post<Company>(ApiEndpoints.company.create(), payload);
  }

  update(id: string, payload: CompanyUpdate): Observable<Company> {
    return this.http.put<Company>(ApiEndpoints.company.update(id), payload);
  }

  /** Soft-delete server-side (sets isActive=false); treated as a normal DELETE. */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.company.remove(id));
  }
}
