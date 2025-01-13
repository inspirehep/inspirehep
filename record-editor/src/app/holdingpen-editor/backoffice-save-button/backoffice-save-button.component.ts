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

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ToastrService, ActiveToast } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

import {
  RecordCleanupService,
  DomUtilsService,
  GlobalAppStateService,
  BackofficeApiService,
} from '../../core/services';
import { SubscriberComponent, ApiError } from '../../shared/classes';
import { WorkflowObject } from '../../shared/interfaces';
import { BackofficeWorkflow } from '../../core/services/backoffice-api.service';
import { HOVER_TO_DISMISS_INDEFINITE_TOAST } from '../../shared/constants';

@Component({
  selector: 're-backoffice-save-button',
  templateUrl: './backoffice-save-button.component.html',
  styleUrls: [
    '../../record-editor/json-editor-wrapper/json-editor-wrapper.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackofficeSaveButtonComponent
  extends SubscriberComponent
  implements OnInit {
  private workflowObject: WorkflowObject;

  private hasAnyValidationProblem = false;
  private savingInfoToast: ActiveToast;

  type: string;
  uuid: string;
  fullWorkflowObject: BackofficeWorkflow;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private apiService: BackofficeApiService,
    private recordCleanupService: RecordCleanupService,
    private domUtilsService: DomUtilsService,
    private globalAppStateService: GlobalAppStateService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  get jsonBeingEdited$() {
    return this.globalAppStateService.jsonBeingEdited$;
  }

  ngOnInit() {
    this.route.params.takeUntil(this.isDestroyed).subscribe(async (params) => {
      this.type = params['type'];
      this.uuid = params['uuid'];
    });
    this.apiService.fetchWorkflowObject(this.type, this.uuid, true).then(
      (data) => { this.fullWorkflowObject = data as BackofficeWorkflow; }
    );
    this.globalAppStateService.hasAnyValidationProblem$
      .takeUntil(this.isDestroyed)
      .subscribe((hasAnyValidationProblem) => {
        this.hasAnyValidationProblem = hasAnyValidationProblem;
        this.changeDetectorRef.markForCheck();
      });

    this.jsonBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe((jsonBeingEdited) => {
        this.workflowObject = jsonBeingEdited as WorkflowObject;
        this.changeDetectorRef.markForCheck();
      });
  }

  get saveButtonDisabledAttribute(): string {
    return this.hasAnyValidationProblem ? 'disabled' : '';
  }

  onClickSave() {
    this.savingInfoToast = this.toastrService.info(
      'Saving workflow object',
      'Loading',
      HOVER_TO_DISMISS_INDEFINITE_TOAST
    );

    this.cleanupAndSave();
  }

  private cleanupAndSave() {
    this.recordCleanupService.cleanup(this.workflowObject.metadata);
    this.apiService.validateWorkflowObject(this.type, this.workflowObject).subscribe(
      (data) => {
        delete this.workflowObject._extra_data['validation_errors'];
        this.jsonBeingEdited$.next(this.workflowObject);
      },
      (error) => {
        this.workflowObject._extra_data['validation_errors'] = error.body;
        this.jsonBeingEdited$.next(this.workflowObject);
        this.displayErrorToast();
      },
      () => {
        this.save();
      }
    );
  }

  private save() {
    this.apiService
      .saveWorkflowObject(this.workflowObject, this.fullWorkflowObject)
      .do(() => this.domUtilsService.unregisterBeforeUnloadPrompt())
      .subscribe(
        () => {
          this.toastrService.clear(this.savingInfoToast.toastId);
          this.toastrService.success(`Workflow object is saved`, 'Success');
        },
        (error) => {
          this.displayErrorToast();
        }
      );
  }

  private displayErrorToast() {
    this.toastrService.clear(this.savingInfoToast.toastId);
    this.toastrService.error('Could not save the workflow object', 'Error');
  }
}
