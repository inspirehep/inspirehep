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

import { FieldSplitResult } from '../../shared/interfaces';

@Injectable()
export class FieldSplitterService {

  readonly REFERENCE_MAPPINGS = {
    t: ['title', 'title'],
    j: ['publication_info', 'journal_title'],
    d: ['dois', '-'],
    c: ['collaborations', '-'],
    i: ['isbn'],
    k: ['texkey'],
    o: ['label'],
    u: ['urls', '-', 'value'],
    r: ['report_number'],
    x: ['arxiv_eprint'],
    v: ['publication_info', 'journal_volume'],
    n: ['publication_info', 'journal_issue'],
    y: ['publication_info', 'year'],
    s: ['publication_info', 'page_start'],
    e: ['publication_info', 'page_end'],
    f: ['publication_info', 'artid'],
    b: ['publication_info', 'cnum'],
    p: ['imprint', 'publisher'],
    a: ['authors', '-', 'full_name'],
    l: ['authors', '-', 'inspire_role']
  };

  /**
   * Generic function to split a field.
   * @param field value of the field
   * @param mappings mappings from shortcut key to relative path
   * @param separator to seperate each split (usage of shortcut key)
   */
  split(field: string, mappings: { [key: string]: Array<any> }, separator = '$$'): FieldSplitResult {
    let regExp = this.buildRegExp(Object.keys(mappings), separator);
    // ['unsplitted', 'key1', 'value1, 'key2, 'value2']
    let rawSplits = field.split(regExp);
    let unsplitted = rawSplits.shift();
    let splits = [];
    for (let i = 0; i < rawSplits.length; i = i + 2) {
      let key = rawSplits[i];
      let value = rawSplits[i + 1];
      splits.push({ path: mappings[key], value });
    }
    return { splits, unsplitted };
  }

  splitReferenceField(misc: string): FieldSplitResult {
    return this.split(misc, this.REFERENCE_MAPPINGS);
  }

  private buildRegExp(keys: Array<string>, separator: string): RegExp {
    // puts '\' before each character
    let escapedSeparator = separator.replace(/./g, '\\$&');
    // joins elements of the array together without comma ['a', 'b'] => 'ab'
    let keySet = keys.join('');
    let regExpString = `${escapedSeparator}([${keySet}])`;
    return new RegExp(regExpString);
  }

}
