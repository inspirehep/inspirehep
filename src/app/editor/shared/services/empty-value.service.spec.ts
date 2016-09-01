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

import { addProviders, inject } from '@angular/core/testing';

import { EmptyValueService } from './empty-value.service';

describe('EmptyValueService', () => {
  let service: EmptyValueService;

  beforeEach(() => addProviders([EmptyValueService]));

  beforeEach(inject([EmptyValueService], (emptyValueService) => {
    service = emptyValueService;
  }));

  it('should respect x_editor_always_show as an object property', () => {
    let schema = {
      type: 'object',
      properties: {
        prop1: {
          type: 'string',
          x_editor_always_show: true
        }
      }
    };
    let empty = service.generateEmptyValue(schema);
    expect(empty['prop1']).toBeDefined();
  });

  it('should respect required for object type', () => {
    let schema = {
      type: 'object',
      properties: {
        prop1: {
          type: 'string'
        }
      },
      required: [
        'prop1'
      ]
    };
    let empty = service.generateEmptyValue(schema);
    expect(empty['prop1']).toBeDefined();
  });

  it('should generate empty object if x_editor_always_show or required not set', () => {
    let schema = {
      type: 'object',
      properties: {
        prop1: {
          type: 'string'
        }
      }
    };
    let empty = service.generateEmptyValue(schema);
    expect(empty['prop1']).toBeUndefined();
  });

  it('should respect x_editor_always_show as a property of array element', () => {
    let schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          prop1: {
            type: 'string',
            x_editor_always_show: true
          }
        }
      }
    };
    let empty = service.generateEmptyValue(schema);
    expect(empty[0]['prop1']).toBeDefined();
  });

});
