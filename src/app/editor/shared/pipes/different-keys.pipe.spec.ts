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

import { DifferentKeysPipe } from './different-keys.pipe';

describe('DifferentKeysPipe', () => {
  let pipe: DifferentKeysPipe;

  beforeEach(() => {
    pipe = new DifferentKeysPipe();
  });

  it('should return different keys', () => {
    let obj1 = {
      propDiff1: 1,
      propA: 1,
      propB: 1,
      propDiff2: 1
    };

    let obj2 = {
      propA: 2,
      propB: 2
    };

    let differentKeys = ['propDiff1', 'propDiff2'];

    let pipeResult = pipe.transform(obj1, obj2);
    expect(pipeResult).toEqual(differentKeys);
  });

  it('should return empty if keys are same', () => {
    let obj1 = {
      propA: 1,
      propB: 1
    };

    let obj2 = {
      propB: 2,
      propA: 2
    };

    let pipeResult = pipe.transform(obj1, obj2);
    expect(pipeResult).toEqual([]);
  });

});
