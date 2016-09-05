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

import { MapToSortedIterablePipe, Pair } from './map-to-sorted-iterable.pipe';

describe('MapToSortedIterablePipe', () => {
  let pipe: MapToSortedIterablePipe;

  beforeEach(() => {
    pipe = new MapToSortedIterablePipe();
  });

  it('should sort by x_editor_priority, larger first', () => {
    let schema = {
      properties: {
        key1: {
          x_editor_priority: 10
        },
        key2: {
          x_editor_priority: 100
        }
      }
    };
    let map = {
      key1: 'value1',
      key2: 'value2'
    };

    let expected = [
      new Pair('key2', 'value2'),
      new Pair('key1', 'value1')
    ];

    expect(pipe.transform(map, schema.properties)).toEqual(expected);
  });

  it('should sort alphabetically if x_editor_priority not set', () => {
    let schema = {
      properties: {
        key1: {},
        key2: {}
      }
    };
    let map = {
      key2: 'value2',
      key1: 'value1'
    };

    let expected = [
      new Pair('key1', 'value1'),
      new Pair('key2', 'value2')
    ];

    expect(pipe.transform(map, schema.properties)).toEqual(expected);
  });

  it('should sort by x_editor_priority, larger first then alphabetically if it is not set for some',
    () => {
      let schema = {
        properties: {
          key1: {
            x_editor_priority: 10
          },
          key2: {
            x_editor_priority: 100
          },
          key3: {},
          key4: {}
        }
      };
      let map = {
        key1: 'value1',
        key2: 'value2',
        key4: 'value4',
        key3: 'value3'
      };

      let expected = [
        new Pair('key2', 'value2'),
        new Pair('key1', 'value1'),
        new Pair('key3', 'value3'),
        new Pair('key4', 'value4')
      ];

      expect(pipe.transform(map, schema.properties)).toEqual(expected);
    });

  it('should sort by x_editor_priority, positive larger first, then alphabetically, then negative',
    () => {
      let schema = {
        properties: {
          key1: {
            x_editor_priority: -100
          },
          key2: {
            x_editor_priority: -10
          },
          key3: {},
          key4: {
            x_editor_priority: 10
          },
          key5: {}
        }
      };
      let map = {
        key5: 'value5',
        key1: 'value1',
        key2: 'value2',
        key4: 'value4',
        key3: 'value3'
      };

      let expected = [
        new Pair('key4', 'value4'),
        new Pair('key3', 'value3'),
        new Pair('key5', 'value5'),
        new Pair('key2', 'value2'),
        new Pair('key1', 'value1')
      ];

      expect(pipe.transform(map, schema.properties)).toEqual(expected);
    });

});
