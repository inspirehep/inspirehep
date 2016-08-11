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

@Injectable()
export class ComponentTypeService {
  
  /**
   * It returns the editor specific type of given schema
   * In other words, which component to use for given schema.
   * 
   * Possible values:
   *  - string, number, boolean, object, enum
   *  - primitive-list, table-list, complex-list
   *  - disabled, autocomplete
   * 
   * @param {Object} schema 
   * @return {string}
   */
  getComponentType(schema: Object): string {
    if (schema['x_editor_disabled']) {
      return 'disabled';
    } else if (schema['x_editor_autocomplete']) {
      return 'autocomplete';
    } else if (schema['enum']) {
      return 'enum';
    }

    let schemaType = schema['type']
    if (!schemaType) {
      return 'raw'
    } else if (schemaType === 'array') {
      let itemSchema = schema['items'];
      if (itemSchema['type'] === 'object') {
        // complex-array: if it's an object array where at least one property of this object is also an object array.
        // so object array in an object array. Array<{property: Array<{...}>...}>
        let isComplexArray = Object.keys(itemSchema['properties'])
          .some(prop => {
            let propSchema = itemSchema['properties'][prop];
            return propSchema['items'] && (propSchema['items']['type'] === 'object');
          });
        if (isComplexArray) {
          return 'complex-list';
        } else {
          return 'table-list';
        }
      } else {
        return 'primitive-list';
      }
    }

    return schemaType;
  }
}

