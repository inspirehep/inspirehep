/*
 * This file is part of ng2-multi-record-editor.
 * Copyright (C) 2017 CERN.
 *
 * record-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * record-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with record-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
 */

import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/zip';

import { environment } from '../../../../environments/environment';
import { CommonApiService } from '../../../core/services';
import {
  UserActions,
  QueryResult,
  RecordsPreview,
  PaginatedRecords,
  SubmitMessage,
} from '../interfaces';

@Injectable()
export class MultiApiService extends CommonApiService {
  private url = `${environment.baseUrl}/api/multieditor`;
  private schemaUrl = `${environment.baseUrl}/schemas/records`;

  constructor(protected http: Http) {
    super(http);
  }

  save(
    userActions: UserActions,
    checkedRecords: string[],
    allSelected: boolean
  ): Observable<SubmitMessage> {
    return this.http
      .post(`${this.url}/update`, {
        userActions,
        ids: checkedRecords,
        allSelected,
      })
      .map(res => res.json());
  }

  previewActions(
    userActions: UserActions,
    pageNumber: number,
    size: number
  ): Observable<RecordsPreview> {
    return this.http
      .post(`${this.url}/preview`, {
        userActions,
        number: pageNumber,
        size,
      })
      .map(res => res.json());
  }

  fetchPaginatedRecords(
    pageNumber: number,
    size: number
  ): Observable<PaginatedRecords> {
    return this.http
      .get(`${this.url}/search?number=${pageNumber}&size=${size}`)
      .map(res => res.json());
  }

  searchRecords(
    query: string,
    pageNumber: number,
    collection: string,
    size: number
  ): Observable<QueryResult> {
    return this.http
      .get(
        `${
          this.url
        }/search?page=${pageNumber}&q=${query}&index=${collection}&size=${size}`
      )
      .map(res => res.json());
  }

  fetchCollectionSchema(collection: string): Observable<object> {
    return this.http
      .get(`${this.schemaUrl}/${collection}.json`)
      .map(res => res.json());
  }
}
