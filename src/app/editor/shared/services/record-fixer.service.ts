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
import { JsonUtilService } from './json-util.service'

@Injectable()
export class RecordFixerService {
  
  private emptyValueService: EmptyValueService = new EmptyValueService();
  private jsonUtilService: JsonUtilService = new JsonUtilService();

  fixRecord(record: Object, schema: Object) {
    Object.keys(schema).forEach(field => this.fix(field, record, schema[field]));
  }

  /**
   * NOTE: the reason that parent and key are passed instead of the direct value
   * is to be able do some operations that needs the parent such as `delete`.
   */
  private fix(key: string | number, parent: Object | Array<any>, schema: Object) {
    // Fix fields that aren't present.
    if (!parent[key]) {
      if (schema['x_editor_always_show']) {
        parent[key] = this.emptyValueService.generateEmptyValue(schema);
      }
    // Fix fields that are present.
    } else {
      if (schema['x_editor_hidden']) {
        delete parent[key];
        return;
      }
      let value = parent[key];
      
      if (this.jsonUtilService.getType(value) === 'ObjectArray') {
        this.fixTableArray(value, schema);
      }

      // Recursive calls
      if (schema['type'] === 'object') {
        Object.keys(schema['properties']).forEach(prop => {
          this.fix(prop, value, schema['properties'][prop]);
        });
      } else if (schema['type'] === 'array') {
        value.forEach((element, index) => {
          this.fix(index, value, schema['items']);
        });
      }
    }
  }



  /**
   * Fixes the UI appearance of array fields that will be rendered as a table.
   *  1. Find all subfields that are present in any item.
   *  2. Insert empty values if an item doesn't have these subfields
   * 
   * Goal is to force all elements to have same subfields so that
   * table looks ok.
   */
  private fixTableArray(array: Array<Object>, schema: Object) {
    let presentKeys = {};
     
     // 1. Step
     array.forEach(element => {
       Object.keys(element).forEach(key => {
         presentKeys[key] = true;
       });
     });

     // 2. Step
     Object.keys(presentKeys).forEach(key => {
       let emptyElement = this.emptyValueService.generateEmptyValue(schema['items']['properties'][key]);
       array.filter(element => !element[key])
        .forEach(element => {
          element[key] = emptyElement;
        });
     });
  }
}