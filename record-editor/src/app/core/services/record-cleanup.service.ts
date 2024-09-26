/*
 * This file is part of record-editor.
 * Copyright (C) 2017 CERN.
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
export class RecordCleanupService {
  cleanup(value: object | Array<any>): void {
    if (Array.isArray(value)) {
      // backwards loop because elements might be removed
      for (let i = value.length - 1; i >= 0; i--) {
        if (typeof value[i] === 'object') {
          this.cleanup(value[i]);
        }
        if (this.isEmpty(value[i])) {
          value.splice(i, 1);
        }
      }
    } else {
      Object.keys(value).forEach((key) => {
        if (typeof value[key] === 'object' && value[key] !== null) {
          this.cleanup(value[key]);
        }
        if (this.isEmpty(value[key])) {
          delete value[key];
        }
      });
    }
  }

  public isEmpty(value: any): boolean {
    if (value === undefined || value === null) {
      return true;
    }

    // string, object, array
    let valueType = typeof value;
    if (valueType === 'string' || valueType === 'object') {
      return Object.keys(value).length === 0;
    }

    // boolean, number
    return false;
  }
}
