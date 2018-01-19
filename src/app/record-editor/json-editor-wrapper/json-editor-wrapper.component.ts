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

import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SchemaValidationProblems } from 'ng2-json-editor';
import { ToastrService } from 'ngx-toastr';

import { RecordApiService, AppConfigService, DomUtilsService, GlobalAppStateService } from '../../core/services';
import { SubscriberComponent } from '../../shared/classes';

@Component({
  selector: 're-json-editor-wrapper',
  templateUrl: './json-editor-wrapper.component.html',
  styleUrls: [
    './json-editor-wrapper.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonEditorWrapperComponent extends SubscriberComponent implements OnInit, OnChanges {
  @Input() recordId?: string;
  @Input() recordType?: string;

  record: object;
  schema: object;
  config: object;
  // `undefined` on current revision
  revision: object | undefined;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private apiService: RecordApiService,
    private appConfigService: AppConfigService,
    private toastrService: ToastrService,
    private domUtilsService: DomUtilsService,
    private globalAppStateService: GlobalAppStateService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['recordId'] || changes['recordType']) && this.recordId && this.recordType) {
      // component loaded and being used by record-search
      this.record = undefined; // don't display old record while new is loading
      this.fetch(this.recordType, this.recordId);
    }
  }

  ngOnInit() {
    this.domUtilsService.registerBeforeUnloadPrompt();
    this.domUtilsService.fitEditorHeightFullPageOnResize();
    this.domUtilsService.fitEditorHeightFullPage();

    if (!this.recordId || !this.recordType) {
      // component loaded via router, @Input() aren't passed
      this.route.params
        .filter(params => params['recid'])
        .takeUntil(this.isDestroyed)
        .subscribe(params => {
          this.fetch(params['type'], params['recid']);
        });
    }

    this.appConfigService.onConfigChange
      .takeUntil(this.isDestroyed)
      .subscribe(config => {
        this.config = Object.assign({}, config);
        this.changeDetectorRef.markForCheck();
      });
  }

  onRecordChange(record: object) {
    // update record if the edited one is not revision.
    if (!this.revision) {
      this.record = record;
      this.globalAppStateService
        .jsonBeingEdited$.next(record);
      this.globalAppStateService
        .isJsonUpdated$.next(true);
    } else {
      this.toastrService.warning('You are changing the revision and your changes will be lost!', 'Warning');
    }
  }

  onRevisionRevert() {
    this.record = this.revision;
    this.revision = undefined;
    this.changeDetectorRef.markForCheck();
  }

  onRevisionChange(revision: Object) {
    this.revision = revision;
    this.changeDetectorRef.markForCheck();
  }

  onValidationProblems(problems: SchemaValidationProblems) {
    this.globalAppStateService
      .validationProblems$.next(problems);
  }

  /**
   * Performs api calls for a single record to be loaded
   * and __assigns__ fetched data to class properties
   *
   * - checks permission
   * - fetches record
   * - fetches schema
   *
   * - shows toast message when any call fails
   */
  private fetch(recordType: string, recordId: string) {
    let loadingToastId;
    this.apiService.checkEditorPermission(recordType, recordId)
      .then(() => {
        // TODO: move toast call out of then after https://github.com/angular/angular/pull/18352
        loadingToastId = this.toastrService.info(
          `Loading ${recordType}/${recordId}`, 'Wait').toastId;
        return this.apiService.fetchRecord(recordType, recordId);
      }).then(json => {
        this.record = json['metadata'];
        this.globalAppStateService
          .jsonBeingEdited$.next(this.record);
        this.globalAppStateService
          .isJsonUpdated$.next(false);
        this.config = this.appConfigService.getConfigForRecord(this.record);
        return this.apiService.fetchUrl(this.record['$schema']);
      }).then(schema => {
        this.toastrService.clear(loadingToastId);
        this.schema = schema;
        this.changeDetectorRef.markForCheck();
      }).catch(error => {
        this.toastrService.clear(loadingToastId);
        if (error.status === 403) {
          this.toastrService.error(`Logged in user can not access to the record: ${recordType}/${recordId}`, 'Forbidden');
        } else {
          this.toastrService.error('Could not load the record!', 'Error');
        }
      });
  }
}
