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

import { Injectable } from '@angular/core';
import {
  SchemaValidationProblems,
  ValidationProblem,
  PathUtilService,
} from 'ng2-json-editor';

import { ValidationError } from '../../shared/interfaces';

@Injectable()
export class WorkflowErrorConverterService {
  constructor(private pathUtilsService: PathUtilService) {}

  toValidationProblems(
    errors: Array<ValidationError>
  ): SchemaValidationProblems {
    const problemsByPath: SchemaValidationProblems = {};
    errors.forEach((error) => {
      const path = this.pathUtilsService.toPathString(error.path);
      const message = error.message;
      const problem: ValidationProblem = {
        type: 'Error',
        message,
      };
      problemsByPath[path] = problemsByPath[path] || [];
      problemsByPath[path].push(problem);
    });
    return problemsByPath;
  }
}
