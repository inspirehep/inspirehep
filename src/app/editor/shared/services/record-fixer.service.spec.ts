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

import { beforeEachProviders, inject, it } from '@angular/core/testing';

import { RecordFixerService } from './record-fixer.service';

describe('RecordFixerService', () => {

  beforeEachProviders(() => [RecordFixerService]);

  it('should add properties that are marked as x_editor_always_show to a record with depth 1',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            prop: {
              type: 'string',
              x_editor_always_show: true
            }
          }
        };

        let record = {};

        recordFixerService.fixRecord(record, schema);

        expect(record['prop']).toBeDefined();
      }
    ));

  it('should add properties that are marked as x_editor_always_show to a record with depth 2',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            level1: {
              type: 'object',
              properties: {
                prop: {
                  type: 'string',
                  x_editor_always_show: true
                }
              }
            }
          }
        };

        let record = {
          level1: {}
        };

        recordFixerService.fixRecord(record, schema);

        expect(record['level1']['prop']).toBeDefined();
      }
    ));

  it('should add properties that are marked as x_editor_always_show to' +
    'a record with depth 2 and without defined parent',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            level1: {
              type: 'object',
              properties: {
                prop: {
                  type: 'string',
                  x_editor_always_show: true
                }
              }
            }
          }
        };

        let record = {};

        recordFixerService.fixRecord(record, schema);

        expect(record['level1']['prop']).toBeDefined();
      }
    ));

  it('should add properties that are marked as x_editor_always_show ' +
    'to a record with depth 2 and with array parent',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            level1: {
              type: 'array',
              items: {
                properties: {
                  prop: {
                    type: 'string',
                    x_editor_always_show: true
                  }
                }
              }
            }
          }
        };

        let record = {
          level1: [
            {}, {}
          ]
        };

        recordFixerService.fixRecord(record, schema);

        record['level1'].forEach(element => expect(element['prop']).toBeDefined());
      }
    ));

  it('should not overwrite existing properties that are marked as x_editor_always_show ' +
    'to a record with depth 2 and with array parent',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            level1: {
              type: 'array',
              items: {
                properties: {
                  prop: {
                    type: 'string',
                    x_editor_always_show: true
                  }
                }
              }
            }
          }
        };

        let record = {
          level1: [
            { prop: 'value1' },
            { prop: 'value2' }
          ]
        };

        let originalValues = record['level1'];
        recordFixerService.fixRecord(record, schema);
        let fixedValues = record['level1'];

        fixedValues.forEach((fixedValue, index) => {
          expect(fixedValue['prop']).toEqual(originalValues[index]['prop']);
        });

      }
    ));

  it('should delete properties that are marked as x_editor_hidden in a record with depth 1',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            prop: {
              type: 'string',
              x_editor_hidden: true
            }
          }
        };

        let record = {
          prop: 'value'
        };

        recordFixerService.fixRecord(record, schema);

        expect(record['prop']).not.toBeDefined();
      }
    ));

  it('should delete properties that are marked as x_editor_hidden in a record with depth 2',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            level1: {
              type: 'object',
              properties: {
                prop: {
                  type: 'string',
                  x_editor_hidden: true
                }
              }
            }
          }
        };

        let record = {
          level1: {
            prop: 'value'
          }
        };

        recordFixerService.fixRecord(record, schema);

        expect(record['level1']['prop']).not.toBeDefined();
      }
    ));

  it('should delete properties that are marked as x_editor_hidden' +
    'in a record with depth 2 and array parent',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            level1: {
              type: 'array',
              items: {
                properties: {
                  prop: {
                    type: 'string',
                    x_editor_hidden: true
                  }
                },
                type: 'object'
              }
            }
          }
        };

        let record = {
          level1: [
            { prop: 'value1' },
            { prop: 'value2' }
          ]
        };

        recordFixerService.fixRecord(record, schema);
        record['level1'].forEach((element => expect(element['prop']).not.toBeDefined()));

      }
    ));

  it('should fix elements of an array in a record, for all to have same properties' +
    'for proper table-list UI look',
    inject([RecordFixerService],
      (recordFixerService: RecordFixerService) => {
        let schema = {
          properties: {
            object_array: {
              type: 'array',
              items: {
                properties: {
                  prop1: {
                    type: 'string'
                  },
                  prop2: {
                    type: 'string'
                  },
                  prop3: {
                    type: 'string'
                  },
                  prop4: {
                    type: 'string'
                  }
                },
                type: 'object'
              }
            }
          }
        };

        let record = {
          object_array: [
            { prop1: 'value' },
            { prop1: 'value', prop2: 'value' },
            { prop1: 'value', prop3: 'value' }
          ]
        };

        recordFixerService.fixRecord(record, schema);

        record['object_array'].forEach(element => {
          expect(element['prop1']).toBeDefined();
          expect(element['prop2']).toBeDefined();
          expect(element['prop3']).toBeDefined();
          expect(element['prop4']).not.toBeDefined();
        });
      }
    ));
});
