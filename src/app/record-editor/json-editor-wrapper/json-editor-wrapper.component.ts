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

import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { ToastrService } from 'ngx-toastr';

import { RecordApiService, AppConfigService, DomUtilsService } from '../../core/services';

@Component({
  selector: 're-json-editor-wrapper',
  templateUrl: './json-editor-wrapper.component.html',
  styleUrls: [
    './json-editor-wrapper.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonEditorWrapperComponent implements OnInit, OnChanges, OnDestroy {
  @Input() recordId?: string;
  @Input() recordType?: string;

  record: object;
  schema: object;
  config: object;
  // `undefined` on current revision
  revision: object;
  private subscriptions: Array<Subscription>;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private apiService: RecordApiService,
    private appConfigService: AppConfigService,
    private toastrService: ToastrService,
    private domUtilService: DomUtilsService) { }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['recordId'] || changes['recordType']) && this.recordId && this.recordType) {
      // component loaded and being used by record-search
      this.fetch(this.recordType, this.recordId);
    }
  }

  ngOnInit() {
    this.domUtilService.fitEditorHeightFullPage();

    this.subscriptions = [];

    if (!this.recordId || !this.recordType) {
      // component loaded via router, @Input() aren't passed
      const paramsRecidSub = this.route.params
        .filter(params => params['recid'])
        .subscribe(params => {
          this.fetch(params['type'], params['recid']);
        });
      this.subscriptions.push(paramsRecidSub);
    }

    const configChangeSub = this.appConfigService.onConfigChange
      .subscribe(config => {
        this.config = Object.assign({}, config);
        this.changeDetectorRef.markForCheck();
      });
    this.subscriptions.push(configChangeSub);
  }

  ngOnDestroy() {
    this.subscriptions
      .forEach(subscription => subscription.unsubscribe());
  }

  onRecordChange(record: object) {
    // update record if the edited one is not revision.
    if (!this.revision) {
      this.record = record;
    } else {
      this.toastrService.warning('You are changing the revisions and your changes will be lost!', 'Warning');
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
    this.apiService.checkEditorPermission(recordType, recordId)
      .then(() => {
        return this.apiService.fetchRecord(recordType, recordId);
      }).then(json => {
        this.record = json['metadata'];
        this.config = this.appConfigService.getConfigForRecord(this.record);
        return this.apiService.fetchUrl(this.record['$schema']);
      }).then(schema => {
        this.schema = schema;
        this.changeDetectorRef.markForCheck();
      }).catch(error => {
        console.error(error);
        if (error.status === 403) {
          this.toastrService.error(`Logged in user can not access to the record: ${recordType}/${recordId}`, 'Forbidden');
        } else {
          this.toastrService.error('Could not load the record!', 'Error');
        }
      });
  }
}
