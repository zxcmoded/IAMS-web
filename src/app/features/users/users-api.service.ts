import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { AdminPage } from '../../core/models/api.model';
import {
  CreateUserResult,
  UserCreate,
  UserDetail,
  UserListItem,
  UserListQuery,
  UserUpdate,
} from './user.model';

/**
 * Typed gateway for User CRUD — the ONLY place that knows the `/api/users` wire
 * shape and query-param names. Effects call these typed methods.
 *
 * Contract notes:
 *  - List envelope is {@link AdminPage}; `page` is 1-based so we map
 *    `page = pageIndex + 1` here. Filters (`role`/`userType`/`isActive`/
 *    `activationStatus`) are omitted when absent (= "all"). Unlike the hierarchy
 *    entities this list has NO `includeInactive` — it uses a tri-state
 *    `isActive` instead, so params are built here rather than via the shared
 *    `buildListParams`.
 *  - Create returns `{ user, activationKey }` — the raw mobile key is present
 *    ONCE (null for web). Update returns the plain {@link UserDetail}.
 *  - There is no DELETE in the contract; users are edited, never removed here.
 */
@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  list(query: UserListQuery): Observable<AdminPage<UserListItem>> {
    let params = new HttpParams()
      .set('page', String((query.pageIndex ?? 0) + 1))
      .set('pageSize', String(query.pageSize ?? 25));

    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.role != null) {
      params = params.set('role', String(query.role));
    }
    if (query.userType) {
      params = params.set('userType', query.userType);
    }
    if (query.isActive != null) {
      params = params.set('isActive', String(query.isActive));
    }
    if (query.activationStatus) {
      params = params.set('activationStatus', query.activationStatus);
    }

    return this.http.get<AdminPage<UserListItem>>(ApiEndpoints.users.list(), { params });
  }

  getById(id: string): Observable<UserDetail> {
    return this.http.get<UserDetail>(ApiEndpoints.users.byId(id));
  }

  create(payload: UserCreate): Observable<CreateUserResult> {
    return this.http.post<CreateUserResult>(ApiEndpoints.users.create(), payload);
  }

  update(id: string, payload: UserUpdate): Observable<UserDetail> {
    return this.http.put<UserDetail>(ApiEndpoints.users.update(id), payload);
  }
}
