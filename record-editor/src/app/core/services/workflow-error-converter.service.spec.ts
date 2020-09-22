/*
 * This file is part of record-editor.
 * Copyright (C) 2018 CERN.
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

import { PathUtilService, SchemaValidationProblems } from 'ng2-json-editor';

import { WorkflowErrorConverterService } from './workflow-error-converter.service';
import { WorkflowValidationError } from '../../shared/interfaces';

describe('WorkflowErrorConverterService', () => {
  let service: WorkflowErrorConverterService;

  beforeEach(() => {
    // PathUtilService is not mocked because we need to fail incase it breaks.
    service = new WorkflowErrorConverterService(new PathUtilService());
  });

  it('should convert errors to validation problems', () => {
    const errors: Array<WorkflowValidationError> = [
      {
        message: 'message1',
        path: ['path', 'to', 1],
      },
      {
        message: 'message12',
        path: ['path', 'to', 1],
      },
      {
        message: 'message2',
        path: ['path', 'to', 2],
      },
    ];
    const expected: SchemaValidationProblems = {
      '/path/to/1': [
        {
          message: 'message1',
          type: 'Error',
        },
        {
          message: 'message12',
          type: 'Error',
        },
      ],
      '/path/to/2': [
        {
          message: 'message2',
          type: 'Error',
        },
      ],
    };

    const result = service.toValidationProblems(errors);
    expect(result).toEqual(expected);
  });
});
