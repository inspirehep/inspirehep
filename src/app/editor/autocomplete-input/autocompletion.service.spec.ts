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

import { provide } from '@angular/core';
import {
  ConnectionBackend,
  HTTP_PROVIDERS,
  Http,
  Response,
  ResponseOptions,
  RequestOptionsArgs
} from '@angular/http';
import { async, addProviders, inject } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';

import { AutocompletionService } from './autocompletion.service';

import { AutocompletionResult, AutocompletionOptions } from './autocompletion.model';

// results will be returened in body of MockHttp response.
const mockResults = [
  { text: 'result1' },
  { text: 'result2' }
];
// path option for AutocompletionService.
const mockOptionsPath = 'stuff.0.results';
// reponse will be returned to any get request by MockHttp.
const getResponseJson = {
  stuff: [
    {
      results: mockResults
    }
  ]
};

class MockHttp extends Http {
  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    let responseOptions = new ResponseOptions({ body: getResponseJson });
    return Observable.of(new Response(responseOptions));
  }
}

describe('AutocompletionService', () => {

  let service: AutocompletionService;

  beforeEach(() => addProviders([
    AutocompletionService,
    ...HTTP_PROVIDERS, // necessary to provide Http fro the component
    provide(Http, { useClass: MockHttp }),
    ConnectionBackend // necessary to provide Http for the component
  ]));

  beforeEach(inject([AutocompletionService], (emptyValueService) => {
    service = emptyValueService;
  }));

  it('should get autocompletion results', (done) => {
    let options = {
      url: 'whatever.json', // ignored for test
      path: mockOptionsPath,
      size: 1 // ignored for test
    };
    service.getAutocompletionResults(options, 'whatever').subscribe(result => {
      expect(result).toEqual(mockResults);
      done();
    });
  });

});
