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
import { RefAnchorAttributes, JsonStoreService, KeysStoreService } from 'ng2-json-editor';

import { FieldSplitterService } from './field-splitter.service';
import { ISO_LANGUAGE_MAP } from '../../shared/constants';

@Injectable()
export class CommonConfigsService {

  constructor(private fieldSplitterService: FieldSplitterService) { }

  readonly isoLanguageMap = ISO_LANGUAGE_MAP;

  readonly anchorBuilder = (url: string): RefAnchorAttributes => {
    let parts = url.split('/');
    let type = parts[parts.length - 2];
    if (type !== 'literature') {
      type = type.slice(0, -1);
    }
    let display = `View ${type}`;
    let href = url.replace(/\/api\//, '/');
    return { href, display };
  }

  readonly fullTextSearch = (value: any, expression: string) => {
    return JSON.stringify(value).search(new RegExp(expression, 'i')) > -1;
  }

  readonly splitPrimitiveReferenceField = (path: Array<any>, value: string, jsonStore: JsonStoreService, keyStore: KeysStoreService) => {
    let splitResult = this.fieldSplitterService.splitReferenceField(value);
    // parent path, ['references', N, 'reference']
    let referencePath = path.slice(0, -2);
    splitResult.splits.forEach(split => {
      // handle array insert
      let relativePath = split.path;
      let insertLast = relativePath.findIndex(el => el === '-');
      if (insertLast > -1) {
        let valueToInsert;
        let sliceIndex = insertLast + 1;
        let insertPath = relativePath.slice(0, sliceIndex);
        if (sliceIndex < relativePath.length) {
          let afterInsertPath = relativePath.slice(sliceIndex);
          let stub = {};
          stub[afterInsertPath[afterInsertPath.length - 1]] = split.value;
          for (let i = afterInsertPath.length - 2; i >= 0; i--) {
            let temp = { [afterInsertPath[i]]: stub };
            stub = temp;
          }
          valueToInsert = stub;
        } else {
          valueToInsert = split.value;
        }
        let fullInsertPath = referencePath.concat(insertPath);
        jsonStore.addIn(fullInsertPath, valueToInsert);
      } else {
        let toPath = referencePath.concat(split.path);
        jsonStore.setIn(toPath, split.value);
      }

    });
    // if all of field is splitted, remove it
    if (!splitResult.unsplitted) {
      let parentPath = path.slice(0, -1);
      // remove even it's parent, if the field is the only element in an array
      if (Number.isInteger(path[path.length - 1]) && jsonStore.getIn(parentPath).size <= 1) {
        jsonStore.removeIn(parentPath);
      } else {
        jsonStore.removeIn(path);
      }
    } else {
      jsonStore.setIn(path, splitResult.unsplitted);
    }
    keyStore.buildKeysMapRecursivelyForPath(jsonStore.getIn(referencePath), referencePath);
  }

}
