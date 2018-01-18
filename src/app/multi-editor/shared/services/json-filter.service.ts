/*
 * This file is part of ng2-multi-record-editor.
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
import { RecordCleanupService } from '../../../core/services';
import { SchemaKeysStoreService } from './schema-keys-store.service';
import * as _ from 'lodash';
import { Set } from 'immutable';

@Injectable()
export class JsonFilterService {

  constructor(private recordCleanupService: RecordCleanupService,
    private schemaKeysStoreService: SchemaKeysStoreService) { }

  filterObjectArray(array: Array<object>, expression: string): Array<object> {
    return array
      .map(record => this.filterObject(record, Set([expression])))
      .filter(value => !this.recordCleanupService.isEmpty(value));
  }

  filterObject(json: object, paths: Set<string>): object {
    const result = {};
    paths.forEach(path => {
      const filteredObject = this.filterObjectRecursively(json, path);
      if (filteredObject) {
        _.merge(result, filteredObject);
      }
    });
    this.recordCleanupService.cleanup(result);
    return result;
  }

  private filterObjectRecursively(json: object, path: string, pathIndex = 0): object {
    const pathArray = path.split(this.schemaKeysStoreService.separator);
    let currentPath = pathIndex < pathArray.length ? pathArray[pathIndex] : undefined;

    if (!currentPath) {
      return json;
    }

    if (!json[currentPath]) {
      return undefined;
    }

    if (Array.isArray(json[currentPath])) {
      const filtered = json[currentPath]
        .map(element => this.filterObjectRecursively(element, path, pathIndex + 1));
      return { [currentPath]: filtered };
    } else if (typeof json[currentPath] === 'object') {
      const filtered = this.filterObjectRecursively(json[currentPath], path, pathIndex + 1);
      if (!this.recordCleanupService.isEmpty(filtered)) {
        return { [currentPath]: filtered };
      } else {
        return undefined;
      }
    } else {
      return { [currentPath]: json[currentPath] };
    }
  }

}
