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

import { Component, Input, ViewEncapsulation} from '@angular/core';

import { AbstractTrackerComponent } from './abstract-tracker';
import { ArrayInArrayFieldComponent } from './array-in-array-field';
import { ObjectArrayFieldComponent } from './object-array-field';
import { ObjectFieldComponent } from './object-field';
import { PrimitiveArrayFieldComponent } from './primitive-array-field';
import { PrimitiveFieldComponent } from './primitive-field';


import { MapToIterablePipe, UnderscoreToSpacePipe } from './shared/pipes';

import {
  JsonUtilService,
  RecordFixerService,
  RecordService,
} from './shared/services';

@Component({
  selector: 'editor',
  encapsulation: ViewEncapsulation.None,
  directives: [
    ArrayInArrayFieldComponent,
    PrimitiveArrayFieldComponent,
    PrimitiveFieldComponent,
    ObjectArrayFieldComponent,
    ObjectFieldComponent
  ],
  pipes: [MapToIterablePipe, UnderscoreToSpacePipe],
  providers: [
    JsonUtilService,
    RecordService,
    RecordFixerService,
  ],
  styles: [
    require('./editor.component.scss')
  ],
  template: require('./editor.component.html'),
})
export class EditorComponent extends AbstractTrackerComponent {
  // TODO: remove dummy
  jsonDoc: any = {};
  schema: any = {};

  constructor(private recordService: RecordService,
    private jsonUtilService: JsonUtilService,
    private recordFixerService: RecordFixerService) {
    super();

    // FIXME: find a better way to make editor wait until we got the schema
    let record;
    
    this.recordService.fetchMockRecord()
      .flatMap(json => {
        record = json;
        return this.recordService.fetchMockSchema()
      }).subscribe(schema => {
        // TODO: Remove these delete, when record comes from DB not from Elasticsearch and schema is more consistent
        Object.keys(record).forEach((prop) => {
          if (schema[prop] == null) {
            delete record[prop];
            console.log('not in schema => ', prop);
          }
        });
        delete record['self']; // ingrone self

        this.recordFixerService.fixRecord(record, schema);
        this.jsonDoc = this.jsonUtilService.flattenMARCJson(record);
        this.schema = schema;
      }, error => console.error(error));
  }

  onValueChange(event: any, key: string) {
    this.jsonDoc[key] = event;
  }

  getType(value: any): string {
    return this.jsonUtilService.getType(value);
  }

  ngOnInit() {
    setTimeout(() => console.log(this.jsonDoc), 8000);
  }
}