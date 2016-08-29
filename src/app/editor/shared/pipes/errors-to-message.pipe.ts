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

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'errorsToMessagesHtml',
  pure: false
})
export class ErrorsToMessagesHtmlPipe implements PipeTransform {

  /**
   * Transforms an array of error object (with message property)
   * to html list of error message
   * 
   * @param {Object} map - the object to be transformed
   * @param {Object} schema - the `schema.propeties` of the object to be used for sorting
   * @return {Array<Pair<any>>} - sorted array of key-value pairs of given map's properties.
   */
  transform(errors: Array<Object>): string {
    if (!errors || errors.length === 0) return undefined;

    return errors
      .map(error => error['message'])
      .reduce((pre, cur) => `<li>${pre}</li><li>${cur}</li>`);
  }
}



