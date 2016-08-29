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
export class SchemaValidationService {

  /**
   * Validate string value against schema
   * 
   * @throws {Error} if value can not be validated
   * 
   * Checks: pattern
   * 
   */
  validateStringValue(value: string, schema: Object) {
    let pattern = schema['pattern'];
    if (pattern && !value.match(pattern)) {
      throw Error(`Does not match with pattern: ${pattern}`);
    }
  }

  /**
   * Validate array value against schema
   * 
   * @throws {Error} if array can not be validated
   * 
   * Checks: uniqueItems
   * 
   */
  validateArray(array: Array<any>, schema) {
    if (schema['uniqueItems']) {
      let hasUniqueItems = (new Set(array)).size === array.length;
      if (hasUniqueItems) {
        throw Error(`All items must be unique`);
      }
    }
  }

}
