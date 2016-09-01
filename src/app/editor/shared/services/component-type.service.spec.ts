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

import { ComponentTypeService } from './component-type.service';

describe('ComponentTypeService', () => {

  let service: ComponentTypeService;

  beforeEach(() => addProviders([ComponentTypeService]));

  beforeEach(inject([ComponentTypeService], (componentTypeService) => {
    service = componentTypeService;
  }));

  it('should return primitive-list', () => {
    let schema = {
      type: 'array',
      items: {
        type: 'string'
      }
    };
    expect(service.getComponentType(schema)).toEqual('primitive-list');
  });

  it('should return table-list', () => {
    let schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          array_prop: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          string_prop: {
            type: 'string'
          }
        }
      }
    };
    expect(service.getComponentType(schema)).toEqual('table-list');
  });

  it('should return complex-list', () => {
    let schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          prop: {
            type: 'array',
            items: {
              type: 'object',
              properties: {}
            }
          }
        }
      }
    };
    expect(service.getComponentType(schema)).toEqual('complex-list');
  });

  it('should return raw', () => {
    let schema = {};
    expect(service.getComponentType(schema)).toEqual('raw');
  });

  it('should return object', () => {
    let schema = {
      type: 'object'
    };
    expect(service.getComponentType(schema)).toEqual('object');
  });

  it('should return autocomplete', () => {
    let schema = {
      x_editor_autocomplete: {}
    };
    expect(service.getComponentType(schema)).toEqual('autocomplete');
  });

  it('should return disabled', () => {
    let schema = {
      x_editor_disabled: true
    };
    expect(service.getComponentType(schema)).toEqual('disabled');
  });

  it('should return enum', () => {
    let schema = {
      enum: {}
    };
    expect(service.getComponentType(schema)).toEqual('enum');
  });

  it('should not return array', () => {
    let schema = {
      type: 'array',
      items: {
        type: 'number'
      }
    };
    expect(service.getComponentType(schema)).not.toEqual('array');
  });
});
