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
import { SchemaKeysStoreService } from './schema-keys-store.service';
import * as _ from 'lodash';
import { Set } from 'immutable';

@Injectable()
export class JsonUtilsService {

  constructor(private schemaKeysStoreService: SchemaKeysStoreService) { }

  filterObjectArray(jsonArray: Array<object>, filterExpression: string) {
    return jsonArray.map(record => this.filterObject(record, Set([filterExpression])))
      .filter(value => !this.isEmpty(value));
  }

  filterObject(json: object, paths: Set<string>): object {
    let result = {};
    paths.forEach(path => {
      let filteredObject = this.filterObjectRecursively(json, path);
      if (filteredObject) {
        _.merge(result, filteredObject);
      }
    });
    this.cleanup(result);
    return result;
  }

  private filterObjectRecursively(json: object, path: string, pathIdx = 0) {
    let pathSplit = path.split(this.schemaKeysStoreService.separator);
    let currentPath = pathIdx < pathSplit.length ? pathSplit[pathIdx] : undefined;

    if (!currentPath) {
      return json;
    }

    if (!json[currentPath]) {
      return undefined;
    }

    if (Array.isArray(json[currentPath])) {
      return {[currentPath]: json[currentPath].map(element => this.filterObjectRecursively(element, path, pathIdx + 1))};
    } else if (typeof json[currentPath] === 'object') {
      let res =  this.filterObjectRecursively(json[currentPath], path, pathIdx + 1);
      if (!this.isEmpty(res)) {
        return {[currentPath]: res};
      } else {
        return undefined;
      }
    } else {
      return {[currentPath]: json[currentPath]};
    }
  }


  cleanup(value: Object) {
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
      Object.keys(value)
      .forEach(key => {
        if (typeof value[key] === 'object') {
          this.cleanup(value[key]);
        }
        if (this.isEmpty(value[key])) {
          delete value[key];
        }
      });
    }
  }

  private isEmpty(value: any) {
    // undefined
    if (value === undefined) {
      return true;
    }

    // string or object
    let valueType = typeof value;
    if (valueType === 'string' || valueType === 'object') {
      return Object.keys(value).length === 0;
    }
    // boolean or number
    return false;
  }
}
