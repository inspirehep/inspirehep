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

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchemaValidationProblems, ValidationProblem } from 'ng2-json-editor';
import { ToastrService } from 'ngx-toastr';

import {
  HoldingpenApiService,
  AppConfigService,
  DomUtilsService,
  GlobalAppStateService,
  WorkflowErrorConverterService
} from '../core/services';
import { SubscriberComponent } from '../shared/classes';
import { WorkflowObject } from '../shared/interfaces';


@Component({
  templateUrl: './holdingpen-editor.component.html',
  styleUrls: [
    '../record-editor/json-editor-wrapper/json-editor-wrapper.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingpenEditorComponent extends SubscriberComponent implements OnInit {
  workflowObject: WorkflowObject;
  schema: Object;
  config: Object;
  workflowProblems: SchemaValidationProblems;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private apiService: HoldingpenApiService,
    private appConfigService: AppConfigService,
    private toastrService: ToastrService,
    private domUtilsService: DomUtilsService,
    private globalAppStateService: GlobalAppStateService,
    private workflowErrorConverterService: WorkflowErrorConverterService) {
    super();
  }

  ngOnInit() {
    this.domUtilsService.registerBeforeUnloadPrompt();
    this.domUtilsService.fitEditorHeightFullPageOnResize();
    this.domUtilsService.fitEditorHeightFullPage();

    this.route.params
      .takeUntil(this.isDestroyed)
      .subscribe(params => {
        this.apiService.fetchWorkflowObject(params['objectid'])
          .then(workflowObject => {
            this.workflowObject = workflowObject;
            this.initWorkflowProblems();
            this.globalAppStateService
              .jsonBeingEdited$.next(workflowObject);
            this.globalAppStateService
              .isJsonUpdated$.next(false);
            this.config = this.appConfigService.getConfigForRecord(this.workflowObject.metadata);
            return this.apiService.fetchUrl(this.workflowObject.metadata['$schema']);
          }).then(schema => {
            this.schema = schema;
            this.changeDetectorRef.markForCheck();
          }).catch(error => {
            this.toastrService.error('Could not load the holdingpen record!', 'Error');
          });
      });

    this.globalAppStateService
      .jsonBeingEdited$
      .skip(1) // it is set already on the first time
      .takeUntil(this.isDestroyed)
      .subscribe(json => {
        this.workflowObject = json as WorkflowObject;
      });

    this.appConfigService.onConfigChange
      .takeUntil(this.isDestroyed)
      .subscribe(config => {
        this.config = Object.assign({}, config);
        this.changeDetectorRef.markForCheck();
      });
  }

  private initWorkflowProblems() {
    const errors = this.workflowExtraData.validation_errors;
    if (errors && errors.length > 0) {
      this.workflowProblems = this.workflowErrorConverterService.toValidationProblems(errors);
    } else {
      this.workflowProblems = {};
    }
  }

  get workflowExtraData() {
    return this.workflowObject._extra_data || {};
  }

  onValidationProblems(problems: SchemaValidationProblems) {
    this.globalAppStateService
      .validationProblems$.next(problems);
  }

  onWorkflowMetadataChange(workflowMetadata: object) {
    this.workflowObject['metadata'] = workflowMetadata;
    this.globalAppStateService
      .jsonBeingEdited$.next(this.workflowObject);
    this.globalAppStateService
      .isJsonUpdated$.next(true);
  }

}
