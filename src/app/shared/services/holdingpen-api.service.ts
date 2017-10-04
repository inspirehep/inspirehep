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
import { CommonApiService } from './common-api.service';

@Injectable()
export class HoldingpenApiService extends CommonApiService {

  // url for currently edited holdingpen object, includes objectId
  private holdingpenObjectApiUrl: string;

  constructor(protected http: Http, protected config: AppConfigService) {
    super(http, config);
  }

  fetchWorkflowObject(objectId: string): Promise<Object> {
    this.holdingpenObjectApiUrl = `${this.config.holdingpenApiUrl}/${objectId}`;
    return this.fetchUrl(this.holdingpenObjectApiUrl);
  }


  saveWorkflowObject(record: Object): Observable<Object> {
    return this.http
      .put(this.holdingpenObjectApiUrl, record)
      .map(res => res.json());
  }
}
