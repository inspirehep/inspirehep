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

@Injectable()
export class ApiService {
  // pid_type and pid_value (see invenio-pidstore)
  private pidType: string;
  private pidValue: string;
  // workflow object id (see invenio-workflows)
  private objectId: string;

  constructor(private http: Http, private config: AppConfigService) {
  }

  fetchUrl(url: string): Promise<Object> {
    return this.http.get(url)
      .map(res => res.json())
      .toPromise();
  }

  fetchRecord(pidType: string, pidValue: string): Promise<Object> {
    this.pidType = pidType;
    this.pidValue = pidValue;
    return this.fetchUrl(this.config.apiUrl(pidType, pidValue));
  }

  fetchWorkflowObject(objectId: string): Promise<Object> {
    this.objectId = objectId;
    return this.fetchUrl(this.config.holdingPenApiUrl(this.objectId));
  }

  saveRecord(record: Object): Observable<Object> {
    return this.http
      .put(this.config.apiUrl(this.pidType, this.pidValue), record)
      .map(res => res.json());
  }

  saveWorkflowObject(record: Object): Observable<Object> {
    return this.http
      .put(this.config.holdingPenApiUrl(this.objectId), record)
      .map(res => res.json());
  }
}
