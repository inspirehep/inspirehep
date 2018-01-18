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
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';

import { editorApiUrl } from '../../shared/config';
import { ApiError } from '../../shared/classes';


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

  authorExtract(source: string): Observable<Array<Object>> {
    return this.http
      .post(`${editorApiUrl}/authorlist/text`, { text: source })
      .catch((error: Response) => Observable.throw(new ApiError(error)))
      .map(res => res.json())
      .map(json => json.authors);
  }

  uploadFile(file: File): Observable<{ url: string }> {
    const fileData = new FormData();
    fileData.append('file', file, file.name);
    return this.http
      .post(`${editorApiUrl}/upload`, fileData)
      .map(res => res.json())
      .map(uploaded => uploaded.path);
  }

}
