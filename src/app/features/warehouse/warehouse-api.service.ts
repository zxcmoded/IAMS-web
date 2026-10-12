import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { buildListParams } from '../../core/api/list-params.util';
import { Warehouse } from '../../core/models/entities.model';
import { AdminPage, ListQuery } from '../../core/models/api.model';

/** Create carries only the immediate parent (locationCode); server derives ancestry. */
export interface WarehouseCreate {
  code: string;
  name: string;
  locationCode: string;
}
export interface WarehouseUpdate {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class WarehouseApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery): Observable<AdminPage<Warehouse>> {
    return this.http.get<AdminPage<Warehouse>>(ApiEndpoints.warehouse.list(), {
      params: buildListParams(query),
    });
  }

  getByCode(code: string): Observable<Warehouse> {
    return this.http.get<Warehouse>(ApiEndpoints.warehouse.byId(code));
  }

  create(payload: WarehouseCreate): Observable<Warehouse> {
    return this.http.post<Warehouse>(ApiEndpoints.warehouse.create(), payload);
  }

  update(code: string, payload: WarehouseUpdate): Observable<Warehouse> {
    return this.http.put<Warehouse>(ApiEndpoints.warehouse.update(code), payload);
  }

  remove(code: string): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.warehouse.remove(code));
  }
}
