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
import { AppConfig } from '../../app.config';

@Injectable()
export class RecordService {
  private pidType: string;
  private pidValue: string;
  private config: AppConfig;

  constructor(private http: Http, config: AppConfig) {
    this.config = config;
  }

  fetchRecord(type: string, recid: string): Observable<{}> {
    this.pidType = type;
    this.pidValue = recid;
    return this.http.get(this.config.apiUrl(this.pidType, this.pidValue))
      .map(res => res.json().metadata);
  }

  fetchSchema(url: string): Observable<{}> {
    return this.http.get(url)
      .map(res => res.json());
  }

  saveRecord(record: Object): Observable<Object> {
    return this.http.put(this.config.apiUrl(this.pidType, this.pidValue), record).map(res => res.json());
  }
}
