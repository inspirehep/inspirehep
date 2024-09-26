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
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';

import {
  GlobalAppStateService,
  RecordApiService,
  RecordCleanupService,
  DomUtilsService,
  ReleaseLockService,
  EditorErrorConverterService,
} from '../../core/services';
import { SubscriberComponent, ApiError } from '../../shared/classes';
import { ToastrService } from 'ngx-toastr';
import { HOVER_TO_DISMISS_INDEFINITE_TOAST } from '../../shared/constants';
import { SchemaValidationProblems } from 'ng2-json-editor';

@Component({
  selector: 're-record-toolbar',
  templateUrl: './record-toolbar.component.html',
  styleUrls: [
    '../json-editor-wrapper/json-editor-wrapper.component.scss',
    './record-toolbar.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordToolbarComponent
  extends SubscriberComponent
  implements OnInit {
  // `undefined` if there is no record being edited
  record: object;
  pidValue: number;
  pidType: string;
  recordProblems: SchemaValidationProblems;

  displayingRevision = false;

  @Output() revisionChange = new EventEmitter<object>();
  @Output() revisionRevert = new EventEmitter<void>();

  private hasAnyValidationProblem = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private apiService: RecordApiService,
    private recordCleanupService: RecordCleanupService,
    private globalAppStateService: GlobalAppStateService,
    private domUtilsService: DomUtilsService,
    private toastrService: ToastrService,
    private releaseLockService: ReleaseLockService,
    private editorErrorConverterService: EditorErrorConverterService
  ) {
    super();
  }

  ngOnInit() {
    this.globalAppStateService.hasAnyValidationProblem$
      .takeUntil(this.isDestroyed)
      .subscribe((hasAnyValidationProblem) => {
        this.hasAnyValidationProblem = hasAnyValidationProblem;
        this.changeDetectorRef.markForCheck();
      });

    this.globalAppStateService.jsonBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe((jsonBeingEdited) => {
        this.record = jsonBeingEdited;
        this.changeDetectorRef.markForCheck();
      });

    this.globalAppStateService.pidValueBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe((pidValueBeingEdited) => {
        this.pidValue = pidValueBeingEdited;
      });

    this.globalAppStateService.pidTypeBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe((pidTypeBeingEdited) => {
        this.pidType = pidTypeBeingEdited;
      });
    this.recordProblems = this.editorErrorConverterService.errorProblems;
  }

  onRevisionChange(revision?: object) {
    this.revisionChange.emit(revision);
    if (revision) {
      // disable save, undo etc. if displaying an older revision
      this.displayingRevision = true;
    } else {
      // enable save, undo etc. if it's back to the current revision
      this.displayingRevision = false;
    }
    this.changeDetectorRef.markForCheck();
  }

  onRevisionRevert() {
    this.revisionRevert.emit();
    // disable save, undo etc. since displayed revision became current
    this.displayingRevision = false;

    this.changeDetectorRef.markForCheck();
  }

  onSaveClick() {
    const references = this.record['references'];
    this.apiService
      .getLinkedReferences(references)
      .then((linkedReferences) => {
        this.record['references'] = linkedReferences;
        const recordWithLinkedReferences = Object.assign({}, this.record);
        this.globalAppStateService.jsonBeingEdited$.next(
          recordWithLinkedReferences
        );
        this.cleanupAndSaveRecord(recordWithLinkedReferences);
      })
      .catch(() => {
        this.cleanupAndSaveRecord(this.record);
      });
  }

  private cleanupAndSaveRecord(record) {
    this.recordCleanupService.cleanup(record);
    this.apiService.saveRecord(record).subscribe(
      () => {
        this.apiService
          .closeCuratedRecordTickets(record, this.pidType, this.pidValue)
          .then(() => {
            this.onSaveSuccess();
          });
      },
      (error) => this.onSaveError(error)
    );
  }

  private onSaveSuccess() {
    this.domUtilsService.unregisterBeforeUnloadPrompt();
    this.releaseLockService.unregisterUnloadPrompt();
    this.toastrService.success('Changes are saved', 'Success');
    // direct assignment to window.location  doesn't compile with this version of TS
    window.location.href = `/${this.pidType}/${this.record['control_number']}`;
  }

  private onSaveError(error: ApiError) {
    this.editorErrorConverterService.setValidationProblems(error);
    if (error.message) {
      this.toastrService.error(
        'Could not save record!',
        'Error',
        HOVER_TO_DISMISS_INDEFINITE_TOAST
      );
    } else {
      this.toastrService.error('Could not save the record', 'Error');
    }
  }

  get saveButtonDisabledAttribute(): string {
    return this.hasAnyValidationProblem ? 'disabled' : '';
  }
}
