import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { buildListParams } from '../../core/api/list-params.util';
import { Location } from '../../core/models/entities.model';
import { AdminPage, ListQuery } from '../../core/models/api.model';

/** Create carries the immediate parent (companyId). Code is user-entered + immutable. */
export interface LocationCreate {
  code: string;
  name: string;
  companyId: string;
  region: string | null;
}
/** Update: only Name + region are editable (code/company are immutable). */
export interface LocationUpdate {
  name: string;
  region: string | null;
}

@Injectable({ providedIn: 'root' })
export class LocationApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery): Observable<AdminPage<Location>> {
    return this.http.get<AdminPage<Location>>(ApiEndpoints.location.list(), {
      params: buildListParams(query),
    });
  }

  getByCode(code: string): Observable<Location> {
    return this.http.get<Location>(ApiEndpoints.location.byId(code));
  }

  create(payload: LocationCreate): Observable<Location> {
    return this.http.post<Location>(ApiEndpoints.location.create(), payload);
  }

  update(code: string, payload: LocationUpdate): Observable<Location> {
    return this.http.put<Location>(ApiEndpoints.location.update(code), payload);
  }

  remove(code: string): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.location.remove(code));
  }
}
