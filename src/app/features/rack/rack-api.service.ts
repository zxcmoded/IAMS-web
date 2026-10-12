import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { buildListParams } from '../../core/api/list-params.util';
import { Rack } from '../../core/models/entities.model';
import { AdminPage, ListQuery } from '../../core/models/api.model';

/** Create carries only the immediate parent (warehouseCode); server derives ancestry. */
export interface RackCreate {
  code: string;
  name: string;
  warehouseCode: string;
}
export interface RackUpdate {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class RackApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery): Observable<AdminPage<Rack>> {
    return this.http.get<AdminPage<Rack>>(ApiEndpoints.rack.list(), {
      params: buildListParams(query),
    });
  }

  getByCode(code: string): Observable<Rack> {
    return this.http.get<Rack>(ApiEndpoints.rack.byId(code));
  }

  create(payload: RackCreate): Observable<Rack> {
    return this.http.post<Rack>(ApiEndpoints.rack.create(), payload);
  }

  update(code: string, payload: RackUpdate): Observable<Rack> {
    return this.http.put<Rack>(ApiEndpoints.rack.update(code), payload);
  }

  remove(code: string): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.rack.remove(code));
  }
}
