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
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { AppConfigService } from './app-config.service';
import { Ticket } from '../interfaces';


@Injectable()
export class ApiService {
  // urls for currently edited record, iclude pidType and pidValue
  private recordApiUrl: string;
  private editorRecordApiUrl: string;
  // url for currently edited holdingpen object, includes objectId
  private holdingpenObjectApiUrl: string;

  constructor(private http: Http, private config: AppConfigService) { }

  fetchUrl(url: string): Promise<Object> {
    return this.http.get(url)
      .map(res => res.json())
      .toPromise();
  }

  fetchRecord(pidType: string, pidValue: string): Promise<Object> {
    this.recordApiUrl = `${this.config.apiUrl}/${pidType}/${pidValue}/db`;
    this.editorRecordApiUrl = `${this.config.editorApiUrl}/${pidType}/${pidValue}`;
    return this.fetchUrl(this.recordApiUrl);
  }

  fetchWorkflowObject(objectId: string): Promise<Object> {
    this.holdingpenObjectApiUrl = `${this.config.holdingpenApiUrl}/${objectId}`;
    return this.fetchUrl(this.holdingpenObjectApiUrl);
  }

  saveRecord(record: Object): Observable<Object> {
    return this.http
      .put(this.recordApiUrl, record)
      .map(res => res.json());
  }

  saveWorkflowObject(record: Object): Observable<Object> {
    return this.http
      .put(this.holdingpenObjectApiUrl, record)
      .map(res => res.json());
  }

  fetchRecordTickets(): Promise<Array<Ticket>> {
    return this.fetchUrl(`${this.editorRecordApiUrl}/rt/tickets`);
  }

  createRecordTicket(ticket: Ticket): Promise<{ id: string, link: string }> {
    return this.http
      .post(`${this.editorRecordApiUrl}/rt/tickets/create`, ticket)
      .map(res => res.json().data)
      .toPromise();
  }

  resolveTicket(ticketId: string): Promise<any> {
    return this.http
      .get(`${this.editorRecordApiUrl}/rt/tickets/${ticketId}/resolve`)
      .toPromise();
  }

  fetchRTUsers(): Observable<Array<string>> {
    return this.http
      .get(`${this.editorRecordApiUrl}/rt/users`)
      .map(res => res.json())
      .map((users: Array<{ name: string }>) => users.map(user => user.name));
  }

  fetchRTQueues(): Observable<Array<string>> {
    return this.http
      .get(`${this.editorRecordApiUrl}/rt/queues`)
      .map(res => res.json())
      .map((queues: Array<{ name: string }>) => queues.map(queue => queue.name));
  }
}
