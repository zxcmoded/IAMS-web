import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEndpoints } from '../../core/api/api-endpoints';
import { buildListParams } from '../../core/api/list-params.util';
import { Bin } from '../../core/models/entities.model';
import { AdminPage, ListQuery } from '../../core/models/api.model';

/** Create carries only the immediate parent (rackCode); server derives ancestry. */
export interface BinCreate {
  code: string;
  name: string;
  rackCode: string;
}
export interface BinUpdate {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class BinApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery): Observable<AdminPage<Bin>> {
    return this.http.get<AdminPage<Bin>>(ApiEndpoints.bin.list(), {
      params: buildListParams(query),
    });
  }

  getByCode(code: string): Observable<Bin> {
    return this.http.get<Bin>(ApiEndpoints.bin.byId(code));
  }

  create(payload: BinCreate): Observable<Bin> {
    return this.http.post<Bin>(ApiEndpoints.bin.create(), payload);
  }

  update(code: string, payload: BinUpdate): Observable<Bin> {
    return this.http.put<Bin>(ApiEndpoints.bin.update(code), payload);
  }

  remove(code: string): Observable<void> {
    return this.http.delete<void>(ApiEndpoints.bin.remove(code));
  }
}
