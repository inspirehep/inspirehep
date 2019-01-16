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

import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService, ActiveToast } from 'ngx-toastr';

import { HoldingpenApiService, RecordCleanupService, DomUtilsService, GlobalAppStateService } from '../../core/services';
import { SubscriberComponent, ApiError } from '../../shared/classes';
import { WorkflowObject, WorkflowSaveErrorBody } from '../../shared/interfaces';
import { HOVER_TO_DISMISS_INDEFINITE_TOAST } from '../../shared/constants';

@Component({
  selector: 're-holdingpen-save-button',
  templateUrl: './holdingpen-save-button.component.html',
  styleUrls: [
    '../../record-editor/json-editor-wrapper/json-editor-wrapper.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingpenSaveButtonComponent extends SubscriberComponent implements OnInit {
  private workflowObject: WorkflowObject;

  private hasAnyValidationProblem = false;
  private savingInfoToast: ActiveToast;

  constructor(private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private apiService: HoldingpenApiService,
    private recordCleanupService: RecordCleanupService,
    private domUtilsService: DomUtilsService,
    private globalAppStateService: GlobalAppStateService,
    private toastrService: ToastrService) {
    super();
  }

  get jsonBeingEdited$() {
    return this.globalAppStateService.jsonBeingEdited$;
  }

  ngOnInit() {
    this.globalAppStateService
      .hasAnyValidationProblem$
      .takeUntil(this.isDestroyed)
      .subscribe(hasAnyValidationProblem => {
        this.hasAnyValidationProblem = hasAnyValidationProblem;
        this.changeDetectorRef.markForCheck();
      });

    this.jsonBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe(jsonBeingEdited => {
        this.workflowObject = jsonBeingEdited as WorkflowObject;
        this.changeDetectorRef.markForCheck();
      });
  }

  get saveButtonDisabledAttribute(): string {
    return this.hasAnyValidationProblem ? 'disabled' : '';
  }

  onClickSave() {
    this.savingInfoToast = this.toastrService.info('Saving workflow object', 'Wait', HOVER_TO_DISMISS_INDEFINITE_TOAST);
    const references = this.workflowObject.metadata['references'];
    this.apiService.getLinkedReferences(references).then(linkedReferences => {
      const metadata = Object.assign({}, this.workflowObject.metadata);
      metadata['references'] = linkedReferences;
      this.workflowObject.metadata = metadata;
      this.jsonBeingEdited$.next(this.workflowObject);
      this.cleanupAndSave();
    }).catch(() => {
      this.cleanupAndSave();
    });
  }

  private cleanupAndSave() {
    this.recordCleanupService.cleanup(this.workflowObject.metadata);
    if (this.callbackUrl) {
      this.saveWithCallbackUrl();
    } else {
      this.save();
    }
  }

  private get callbackUrl(): string | undefined {
    return this.workflowObject._extra_data ? this.workflowObject._extra_data.callback_url : undefined;
  }

  private saveWithCallbackUrl() {
    this.apiService.saveWorkflowObjectWithCallbackUrl(this.workflowObject, this.callbackUrl)
      .do(() => this.domUtilsService.unregisterBeforeUnloadPrompt())
      .subscribe((body) => {
        if (this.hasConflicts()) {
          this.toastrService.clear(this.savingInfoToast.toastId);
          this.toastrService.success(body.message, 'Success');
        } else {
          if (body.redirect_url) {
            window.location.href = body.redirect_url;
          } else {
            const referrer = document.referrer;
            const origin = window.location.origin;
            const redirectUrl = referrer.startsWith(origin) ? referrer : `/holdingpen/${this.workflowObject.id}`;
            window.location.href = redirectUrl;
          }
        }
      }, (error: ApiError<WorkflowSaveErrorBody>) => {
        if (error.status === 400 && error.body.error_code === 'VALIDATION_ERROR') {
          this.jsonBeingEdited$.next(error.body.workflow);
        }
        this.displayErrorToast(error);
      });
  }

  private hasConflicts(): boolean {
    const extraData = this.workflowObject._extra_data;
    return extraData && extraData.conflicts && extraData.conflicts.length > 0;
  }

  private save() {
    this.apiService.saveWorkflowObject(this.workflowObject)
      .do(() => this.domUtilsService.unregisterBeforeUnloadPrompt())
      .subscribe(() => {
        this.toastrService.clear(this.savingInfoToast.toastId);
        this.toastrService.success(`Workflow object is saved`, 'Success');
      }, (error) => {
        this.displayErrorToast(error);
      });
  }

  private displayErrorToast(error: ApiError) {
    this.toastrService.clear(this.savingInfoToast.toastId);
    const errorMessage = error.message || 'Could not save the workflow object';
    this.toastrService.error(errorMessage, 'Error');
  }
}
