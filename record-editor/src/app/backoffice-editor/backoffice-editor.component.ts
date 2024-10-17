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

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchemaValidationProblems } from 'ng2-json-editor';

import {
  BackofficeApiService,
  AppConfigService,
  GlobalAppStateService,
  WorkflowErrorConverterService,
} from '../core/services';
import { SubscriberComponent } from '../shared/classes';
import { WorkflowObject } from '../shared/interfaces';

@Component({
  templateUrl: './backoffice-editor.component.html',
  styleUrls: [
    '../record-editor/json-editor-wrapper/json-editor-wrapper.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackofficeEditorComponent
  extends SubscriberComponent
  implements OnInit {
  workflowObject: WorkflowObject;
  schema: Object;
  config: Object;
  workflowProblems: SchemaValidationProblems;
  uuid: string;

  constructor(
    private route: ActivatedRoute,
    private apiService: BackofficeApiService,
    private appConfigService: AppConfigService,
    private globalAppStateService: GlobalAppStateService,
    private workflowErrorConverterService: WorkflowErrorConverterService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.params.takeUntil(this.isDestroyed).subscribe(async (params) => {
      this.uuid = params['uuid'];

      this.workflowObject = await this.apiService.fetchWorkflowObject(
        this.uuid
      ) as WorkflowObject;
      this.schema = await this.apiService.fetchSchema();
      this.setWorkflowProblems();
      this.globalAppStateService.jsonBeingEdited$.next(this.workflowObject);
      this.globalAppStateService.isJsonUpdated$.next(false);
      this.config = this.appConfigService.getConfigForRecord(
        this.workflowObject.metadata
      );
    });
  }

  private setWorkflowProblems() {
    const errors = this.workflowExtraData.validation_errors;
    if (errors && errors.length > 0) {
      this.workflowProblems =
        this.workflowErrorConverterService.toValidationProblems(errors);
    } else {
      this.workflowProblems = {};
    }
  }

  private injectValidationErrorsIntoExtraData() {
    this.workflowObject._extra_data.validation_errors = this.workflowObject.validation_errors;
  }

  get workflowExtraData() {
    this.workflowObject._extra_data = this.workflowObject._extra_data || {};
    if (this.workflowObject.validation_errors) {
      this.injectValidationErrorsIntoExtraData();
    }
    return this.workflowObject._extra_data;
  }

  onValidationProblems(problems: SchemaValidationProblems) {
    this.globalAppStateService.validationProblems$.next(problems);
  }

  onWorkflowMetadataChange(metadata: object) {
    const workflowObject = Object.assign({}, this.workflowObject, {
      metadata,
    });
    this.globalAppStateService.jsonBeingEdited$.next(workflowObject);
    this.globalAppStateService.isJsonUpdated$.next(true);
  }
}
