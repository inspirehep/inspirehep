/*
 * This file is part of record-editor.
 * Copyright (C) 2018 CERN.
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

import { immutableMergeWithConcattingArrays } from './utils';

describe('Utils', () => {
  describe('immutableMergeWithConcattingArrays', () => {
    it('concats arrays during merging', () => {
      const obj1 = { array: [1] };
      const obj2 = { array: [2, 3] };
      const expected = { array: [1, 2, 3] };
      const result = immutableMergeWithConcattingArrays(obj1, obj2);
      expect(result).toEqual(expected);
    });

    it('overrides if only one of them is array', () => {
      const obj1 = { foo: [1], another: 'value' };
      const obj2 = { foo: 'bar', another: [2] };
      const expected = { foo: 'bar', another: [2] };
      const result = immutableMergeWithConcattingArrays(obj1, obj2);
      expect(result).toEqual(expected);
    });

    it('merges simple objects', () => {
      const obj1 = { a: 'a1', b: 'b1' };
      const obj2 = { b: 'b2', c: 'c2' };
      const expected = { a: 'a1', b: 'b2', c: 'c2' };
      const result = immutableMergeWithConcattingArrays(obj1, obj2);
      expect(result).toEqual(expected);
    });

    it('clones destination before merging', () => {
      const obj1 = { a: 'a1' };
      const obj2 = { b: 'b2' };
      const result = immutableMergeWithConcattingArrays(obj1, obj2);
      expect(result).not.toBe(obj1);
    });
  });
});
