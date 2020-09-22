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

import {
  RefAnchorAttributes,
  JsonStoreService,
  KeysStoreService,
  AutocompletionConfig,
  CustomFormatValidation,
} from 'ng2-json-editor';

import { environment } from '../../../environments/environment';
import { ISO_LANGUAGE_MAP } from '../../shared/constants';
import { splitReferenceField } from './field-splitter';

export const isoLanguageMap = ISO_LANGUAGE_MAP;

export const setRecordRefAndCuratedOnCompletionSelect = (
  path,
  completion,
  store
) => {
  path.splice(-1, 1, 'record');
  store.setIn(path, completion['_source']['self']);

  path.splice(-1, 1, 'curated_relation');
  store.setIn(path, true);
};

export const affiliationAutocompletionConfig: AutocompletionConfig = {
  url: `${environment.baseUrl}/api/institutions/_suggest?affiliation=`,
  path: '/affiliation/0/options',
  optionField: '/_source/legacy_ICN',
  size: 20,
  itemTemplateName: 'affiliationAutocompleteTemplate',
  onCompletionSelect: setRecordRefAndCuratedOnCompletionSelect,
};

export const journalTitleAutocompletionConfigWithoutPopulatingRef: AutocompletionConfig = {
  url: `${environment.baseUrl}/api/journals/_suggest?journal_title=`,
  path: '/journal_title/0/options',
  optionField: '/_source/short_title',
  size: 10,
};

export const journalTitleAutocompletionConfig: AutocompletionConfig = {
  ...journalTitleAutocompletionConfigWithoutPopulatingRef,
  onCompletionSelect: (path, completion, store) => {
    path.splice(-1, 1, 'journal_record');
    store.setIn(path, completion['_source']['self']);

    path.splice(-1, 1, 'curated_relation');
    store.setIn(path, true);
  },
};

export const customValidationForDateTypes: CustomFormatValidation = {
  date: {
    formatChecker: value => {
      let formats = [/^\d{4}$/, /^\d{4}-\d{2}$/, /^\d{4}-\d{2}-\d{2}$/];
      return formats.some(format => {
        if (value.match(format)) {
          return Date.parse(value) !== NaN;
        }
        return false;
      });
    },
  },
  'date-time': {
    formatChecker: value => {
      let regex = /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i;
      if (value.match(regex)) {
        return true;
      }
      return false;
    },
  },
};

export function fullTextSearch(value: any, expression: string): boolean {
  return JSON.stringify(value).search(new RegExp(expression, 'i')) > -1;
}

export function anchorBuilder(url: string): RefAnchorAttributes {
  const parts = url.split('/');
  let type = parts[parts.length - 2];
  const display = `View ${type.replace(/s$/, '')}`; // de pluralize
  const href = url.replace('/api/', '/');
  return { href, display };
}

export function splitPrimitiveReferenceField(
  path: Array<any>,
  value: string,
  jsonStore: JsonStoreService,
  keyStore: KeysStoreService
) {
  let splitResult = splitReferenceField(value);
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
    if (
      Number.isInteger(path[path.length - 1]) &&
      jsonStore.getIn(parentPath).size <= 1
    ) {
      jsonStore.removeIn(parentPath);
    } else {
      jsonStore.removeIn(path);
    }
  } else {
    jsonStore.setIn(path, splitResult.unsplitted);
  }
  keyStore.buildKeysMapRecursivelyForPath(
    jsonStore.getIn(referencePath),
    referencePath
  );
}
