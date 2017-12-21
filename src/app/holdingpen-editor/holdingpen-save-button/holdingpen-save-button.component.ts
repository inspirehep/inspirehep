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
import { ToastrService } from 'ngx-toastr';

import { HoldingpenApiService, RecordCleanupService, DomUtilsService, GlobalAppStateService } from '../../core/services';
import { SubscriberComponent } from '../../shared/classes';

@Component({
  selector: 're-holdingpen-save-button',
  templateUrl: './holdingpen-save-button.component.html',
  styleUrls: [
    '../../record-editor/json-editor-wrapper/json-editor-wrapper.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingpenSaveButtonComponent extends SubscriberComponent implements OnInit {
  private workflowObject: object;

  private hasAnyValidationProblem = false;
  private hadConflictsIntially: boolean;

  constructor(private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private apiService: HoldingpenApiService,
    private recordCleanupService: RecordCleanupService,
    private domUtilsService: DomUtilsService,
    private globalAppStateService: GlobalAppStateService,
    private toastrService: ToastrService) {
    super();
  }

  ngOnInit() {
    this.globalAppStateService
      .hasAnyValidationProblem$
      .takeUntil(this.isDestroyed)
      .subscribe(hasAnyValidationProblem => {
        this.hasAnyValidationProblem = hasAnyValidationProblem;
        this.changeDetectorRef.markForCheck();
      });
    this.globalAppStateService
      .jsonBeingEdited$
      .first()
      .map(jsonBeingEdited => this.hasConflicts(jsonBeingEdited))
      .subscribe(hasConflicts => {
        this.hadConflictsIntially = hasConflicts;
      });

    const jsonBeingEdited$ = this.globalAppStateService
      .jsonBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe(jsonBeingEdited => {
        this.workflowObject = jsonBeingEdited;
        this.changeDetectorRef.markForCheck();
      });
  }

  get saveButtonDisabledAttribute(): string {
    return this.hasAnyValidationProblem ? 'disabled' : '';
  }

  onClickSave(event: Object) {
    this.recordCleanupService.cleanup(this.workflowObject['metadata']);
    this.apiService.saveWorkflowObject(this.workflowObject)
      .do(() => this.domUtilsService.unregisterBeforeUnloadPrompt())
      .filter(() => this.shouldContinueWorkflow())
      .switchMap(() => this.apiService.continueWorkflow())
      .subscribe({
        error: (error) => this.displayErrorToast(error)
      });
  }

  private shouldContinueWorkflow(): boolean {
    return this.isManualMerge() ||
      (this.hadConflictsIntially && !this.hasConflicts(this.workflowObject));
  }

  private isManualMerge(): boolean {
    const workflowName = this.workflowObject['_workflow']['workflow_name'];
    return workflowName === 'MERGE';
  }

  private hasConflicts(workflowObject: object): boolean {
    const conflicts = workflowObject['_extra_data']['conflicts'];
    return conflicts && conflicts.length > 0;
  }

  private displayErrorToast(error: Response) {
    let body;
    if (error.status === 400) {
      body = error.json();
    }

    if (body && body.message) {
      this.toastrService.error(body.message, 'Error', { closeButton: true, timeOut: 15000 });
    } else {
      console.error(error);
      this.toastrService.error('Could not save the workflow object', 'Error');
    }
  }
}
