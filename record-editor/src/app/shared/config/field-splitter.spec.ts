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

import { split } from './field-splitter';

describe('FieldSplitter', () => {
  it('should split all the field if there is separator at the beginning of field', () => {
    let field = '$$aFirst$$bSecond$$cThird';
    let mappings = {
      a: ['to', 'a'],
      b: ['to', 'b'],
      c: ['to', 'c'],
    };
    let expectedSplits = [
      { path: ['to', 'a'], value: 'First' },
      { path: ['to', 'b'], value: 'Second' },
      { path: ['to', 'c'], value: 'Third' },
    ];
    let expectedUnsplitted = '';
    let result = split(field, mappings);
    expect(result.splits).toEqual(expectedSplits);
    expect(result.unsplitted).toEqual(expectedUnsplitted);
  });

  it('should split the field and save unsplitted part if there is no separator at the beginning of field', () => {
    let field = 'Unsplitted$$aFirst$$bSecond';
    let mappings = {
      a: ['to', 'a'],
      b: ['to', 'b'],
    };
    let expectedSplits = [
      { path: ['to', 'a'], value: 'First' },
      { path: ['to', 'b'], value: 'Second' },
    ];
    let expectedUnsplitted = 'Unsplitted';
    let result = split(field, mappings);
    expect(result.splits).toEqual(expectedSplits);
    expect(result.unsplitted).toEqual(expectedUnsplitted);
  });

  it('should not split if key is not defined in mappings', () => {
    let field = '$$aFirst$$bSecond';
    let mappings = {
      a: ['to', 'a'],
    };
    let expectedSplits = [{ path: ['to', 'a'], value: 'First$$bSecond' }];
    let result = split(field, mappings);
    expect(result.splits).toEqual(expectedSplits);
  });
});
