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
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { editorApiUrl } from '../../shared/config';
import { ApiError } from '../../shared/classes';
import { AuthorExtractResult, Ticket, RecordRevision } from '../../shared/interfaces';


@Injectable()
export class CommonApiService {

  constructor(protected http: Http) { }

  fetchUrl(url: string): Promise<Object> {
    return this.http.get(url)
      .map(res => res.json())
      .toPromise();
  }

  refExtract(source: string, sourceType: string): Promise<Array<Object>> {
    let body = { [sourceType]: source };
    return this.http
      .post(`${editorApiUrl}/refextract/${sourceType}`, body)
      .map(res => res.json())
      .toPromise();
  }

  authorExtract(source: string): Observable<AuthorExtractResult> {
    return this.http
      .post(`${editorApiUrl}/authorlist/text`, { text: source })
      .catch(error => Observable.throw(new ApiError(error)))
      .map(res => res.json());
  }

  uploadFile(file: File): Observable<{ url: string }> {
    const fileData = new FormData();
    fileData.append('file', file, file.name);
    return this.http
      .post(`${editorApiUrl}/upload`, fileData)
      .map(res => res.json())
      .map(uploaded => uploaded.path);
  }

  // TODO: remove `literature` placeholders after backend refactor (tickets and revisions)

  fetchRecordTickets(recordId: string | number): Promise<Array<Ticket>> {
    return this.fetchUrl(`${editorApiUrl}/literature/${recordId}/rt/tickets`) as Promise<Array<Ticket>>;
  }

  createRecordTicket(recordId: string | number, ticket: Ticket): Promise<{ id: string, link: string }> {
    return this.http
      .post(`${editorApiUrl}/literature/${recordId}/rt/tickets/create`, ticket)
      .map(res => res.json().data)
      .toPromise();
  }

  // TODO: remove `recordId` param after backend refactor
  resolveTicket(recordId: string | number, ticketId: string): Promise<any> {
    return this.http
      .get(`${editorApiUrl}/literature/${recordId}/rt/tickets/${ticketId}/resolve`)
      .toPromise();
  }

  fetchRTUsers(): Observable<Array<string>> {
    return this.http
      .get(`${editorApiUrl}/rt/users`)
      .map(res => res.json())
      .map((users: Array<{ name: string }>) => users.map(user => user.name));
  }

  fetchRTQueues(): Observable<Array<string>> {
    return this.http
      .get(`${editorApiUrl}/rt/queues`)
      .map(res => res.json())
      .map((queues: Array<{ name: string }>) => queues.map(queue => queue.name));
  }

  getLinkedReferences(references: Array<object> | undefined): Promise<Array<object> | void> {
    if (!references) {
      return Promise.resolve();
    }

    return this.http
      .post(`${editorApiUrl}/linked_references`, { references })
      .catch(error => Observable.throw(new ApiError(error)))
      .map(res => res.json())
      .map(json => json.references)
      .toPromise();
  }

  fetchRevisions(pidType: string, pidValue: number): Promise<Array<RecordRevision>> {
    return this.http
      .get(`${editorApiUrl}/${pidType}/${pidValue}/revisions`)
      .map(res => res.json())
      .toPromise();
  }

  fetchRevisionData(transactionId: number, recUUID: string): Promise<Object> {
    return this.http
      .get(`${editorApiUrl}/revisions/${recUUID}/${transactionId}`)
      .map(res => res.json())
      .toPromise();
  }

  revertToRevision(pidType: string, pidValue: number, revisionId: number): Promise<void> {
    return this.http
      .put(`${editorApiUrl}/${pidType}/${pidValue}/revisions/revert`, { revision_id: revisionId })
      .map(res => res.json())
      .toPromise();
  }
}
