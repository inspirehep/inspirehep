/*
 * This file is part of record-editor.
 * Copyright (C) 2017 CERN.
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
import { Subject } from 'rxjs/Subject';
import { SchemaValidationProblems } from 'ng2-json-editor';

import { editorConfigs } from '../../shared/config';
import { onDocumentTypeChange } from '../../shared/config/hep';

@Injectable()
export class GlobalAppStateService {
  readonly jsonBeingEdited$ = new Subject<object>();

  readonly isJsonUpdated$ = new Subject<boolean>();

  readonly validationProblems$ = new Subject<SchemaValidationProblems>();
  readonly hasAnyValidationProblem$ = this.validationProblems$
    .map(problems => this.hasAnyValidationProblem(problems));

  private hasAnyValidationProblem(problems: SchemaValidationProblems): boolean {
    return Object.keys(problems)
      .some(path => problems[path].length > 0);
  }
}
