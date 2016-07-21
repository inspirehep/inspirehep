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
import { EmptyValueService } from './empty-value.service';

@Injectable()
export class RecordFixerService {

  private emptyValueService: EmptyValueService = new EmptyValueService();
  
  /**
   * Fixes the record for the better UI appearance.
   * Makes use of schema to get types
   */
  fixRecord(record: Object, schema: Object) {
    Object.keys(schema).filter(field => record[field])
      .forEach(field => {
        // TODO: use getType
        if (schema[field].type === 'array' && schema[field].items.properties) {
          // Check if the array field has any property that is also an array. (Arrayception)
          let subSchema = schema[field].items.properties;
          let hasAnyArrayFields = Object.keys(subSchema)
            .some(subField => subSchema[subField].type === 'array');
          if (!hasAnyArrayFields) {
            // This field will be represented as a table (ObjectArray)
            this.insertEmptyForMissingFields(record[field], subSchema);
          }
        }
      });
  }

  /**
   * Insert empty values for fields that are in the schema
   * but not present in given record
   *
   */
  private insertEmptyForMissingFields(record: Array<Object>, schema: Object) {
    Object.keys(schema).forEach(field => {
      record.filter(element => element[field] == null)
        .forEach(element => {
          element[field] = this.emptyValueService.generateEmptyValue(schema[field]);
        });
    });
  }
}