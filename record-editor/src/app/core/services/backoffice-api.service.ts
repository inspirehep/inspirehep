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

import { Observable } from 'rxjs/Observable';

import { CommonApiService } from './common-api.service';
import { backofficeApiUrl, hepSchemaUrl } from '../../shared/config';
import { ApiError } from '../../shared/classes';
import { WorkflowObject } from '../../shared/interfaces';
import { BackofficeApiAuthService } from '../services/backoffice-api-auth.service';

export interface BackofficeWorkflow {
  id: number;
  workflow_type: string;
  status: string;
  core: boolean;
  data: {
    name: {
      value: string;
      preferred_name?: string;
    };
    status?: string;
    $schema: string;
    _collections: ['Authors'];
    control_number?: number;
    acquisition_source: {
      email: string | null;
      orcid: string | null;
      method: string | null;
      source: string | null;
      datetime: string | null;
      internal_uid: string | number;
    };
  };
  is_update: boolean;
  _created_at: string;
  _updated_at: string;
  tickets: {
    ticket_id: string;
    ticket_url: string;
  }[];
  [key: string]: any;
}

@Injectable()
export class BackofficeApiService extends CommonApiService {
  private currentWorkflowObjectApiUrl: string;

  constructor(
    protected http: Http,
    private authService: BackofficeApiAuthService
  ) {
    super(http);
  }

  fetchSchema(): Promise<object> {
    return this.fetchUrl(`${hepSchemaUrl}`);
  }

  async fetchWorkflowObject(
    objectId: string,
    getFullObject?: boolean
  ): Promise<WorkflowObject | BackofficeWorkflow> {
    return this.handleRequest(async () => {
      this.currentWorkflowObjectApiUrl = `${backofficeApiUrl}/workflows/${objectId}`;
      const token = localStorage.getItem('backoffice.token');
      const response = await this.fetchUrl<BackofficeWorkflow>(
        this.currentWorkflowObjectApiUrl,
        {
          headers: new Headers({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        }
      );

      if (getFullObject) {
        return response;
      } else {
        return {
          id: response.id,
          metadata: {
            $schema: this.fetchSchema(),
            ...response.data,
          },
          _extra_data: {},
        };
      }
    });
  }

  validateWorkflowObject(object: WorkflowObject): Observable<Object> {
    const token = localStorage.getItem('backoffice.token');

    return this.http
    .post(`${backofficeApiUrl}/workflows/authors/validate/`, object.metadata, {
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    })
    .catch((error) => Observable.throw(new ApiError(error)))
    .map((res) => res.json());
  }

  saveWorkflowObject(object: WorkflowObject, request_data): Observable<void> {
    const token = localStorage.getItem('backoffice.token');

    return this.http
      .put(
        this.currentWorkflowObjectApiUrl,
        { ...request_data, data: object.metadata },
        {
          headers: new Headers({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        }
      )
      .catch((error) => Observable.throw(new ApiError(error)))
      .map((res) => res.json());
  }

  private handleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return requestFn().catch((error) => {
      if (error.status === 403) {
        const refreshToken = localStorage.getItem('backoffice.refreshToken');

        if (!refreshToken) {
          return Promise.reject(error);
        }

        return this.authService
          .refreshToken(refreshToken)
          .then((response) => {
            localStorage.setItem('backoffice.token', response.access);

            return requestFn();
          })
          .catch((refreshError) => {
            return Promise.reject(refreshError);
          });
      }

      return Promise.reject(error);
    });
  }
}
