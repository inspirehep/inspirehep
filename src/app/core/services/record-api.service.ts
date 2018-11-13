/*
 * This file is part of record-editor.
 * Copyright (C) 2016 CERN.
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
import { Http, Headers } from '@angular/http';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { CommonApiService } from './common-api.service';
import { ApiError } from '../../shared/classes';
import { editorApiUrl, apiUrl } from '../../shared/config';

@Injectable()
export class RecordApiService extends CommonApiService {

  private currentRecordApiUrl: string;
  private currentRecordEditorApiUrl: string;
  private currentRecordId: string;

  private readonly returnOnlyIdsHeaders = new Headers({ Accept: 'application/vnd+inspire.ids+json' });

  readonly newRecordFetched$ = new ReplaySubject<void>(1);

  constructor(protected http: Http) {
    super(http);
  }

  checkEditorPermission(pidType: string, pidValue: string): Promise<any> {
    this.currentRecordEditorApiUrl = `${editorApiUrl}/${pidType}/${pidValue}`;
    return this.http
      .get(`${this.currentRecordEditorApiUrl}/permission`)
      .toPromise();
  }

  fetchRecord(pidType: string, pidValue: string): Promise<Object> {
    this.currentRecordId = pidValue;
    this.currentRecordApiUrl = `${apiUrl}/${pidType}/${pidValue}`;
    this.currentRecordEditorApiUrl = `${editorApiUrl}/${pidType}/${pidValue}`;
    this.newRecordFetched$.next(null);
    return this.fetchUrl(this.currentRecordApiUrl);
  }

  saveRecord(record: object): Observable<void> {
    return this.http
      .put(this.currentRecordApiUrl, record)
      .catch(error => Observable.throw(new ApiError(error)));
  }

  searchRecord(recordType: string, query: string): Observable<Array<number>> {
    return this.http
      .get(`${apiUrl}/${recordType}/?q=${query}&size=200`, { headers: this.returnOnlyIdsHeaders })
      .map(res => res.json())
      .map(json => json.hits.recids);
  }

  preview(record: object): Promise<string> {
    return this.http
      .post(`${environment.baseUrl}/editor/preview`, record)
      .map(response => response.text())
      .toPromise();
  }

  manualMerge(updateRecordId: string): Observable<number> {
    const body = {
      head_recid: this.currentRecordId,
      update_recid: updateRecordId
    };
    return this.http
      .post(`${editorApiUrl}/manual_merge`, body)
      .map(res => res.json())
      .map(json => json.workflow_object_id);
  }

}
