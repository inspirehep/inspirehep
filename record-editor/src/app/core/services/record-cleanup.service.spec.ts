/*
 * This file is part of ng2-json-editor.
 * Copyright (C) 2016 CERN.
 *
 * ng2-json-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * ng2-json-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ng2-json-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
*/

import { RecordCleanupService } from './record-cleanup.service';

describe('RecordCleanupService', () => {

  let service: RecordCleanupService;

  beforeEach(() => {
    service = new RecordCleanupService();
  });

  it('should cleanup empty array elements (nested)', () => {
    let record = {
      array: [
        '',
        undefined,
        0,
        true,
        false,
        'foo',
        'bar',
        '',
        'foobar',
        '',
        {},
        [1, ''],
        [],
        { foo: [{ bar: [] }] },
        { foo: 'bar', empty: '' },
        [{ foo: { empty: '' } }]
      ]
    };
    let expected = {
      array: [
        0,
        true,
        false,
        'foo',
        'bar',
        'foobar',
        [1],
        { foo: 'bar' }
      ]
    };
    service.cleanup(record);
    expect(record).toEqual(expected);
  });

  it('should cleanup empty object properties (nested)', () => {
    let record = {
      emtpyString: '',
      emptyObject: {},
      emptyArray: [],
      nestedEmpty: { foo: { nested: { evenMore: '' } } },
      undefinedProperty: undefined,
      prop1: '',
      prop2: 0,
      prop3: 1,
      prop4: { foo: 'bar', empty: [] },
      prop5: [1, undefined]
    };
    let expected = {
      prop2: 0,
      prop3: 1,
      prop4: { foo: 'bar' },
      prop5: [1]
    };
    service.cleanup(record);
    expect(record).toEqual(expected);
  });
});
