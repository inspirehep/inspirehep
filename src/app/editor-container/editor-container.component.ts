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

import { ToastrService } from 'ngx-toastr';

import { RecordApiService, AppConfigService } from '../shared/services';

@Component({
  templateUrl: './editor-container.component.html',
  styleUrls: [
    './editor-container.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorContainerComponent implements OnInit {
  record: Object;
  schema: Object;
  config: Object;
  // `undefined` on current revision
  revision: Object;

  constructor(private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private apiService: RecordApiService,
    private appConfigService: AppConfigService,
    private toastrService: ToastrService) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        let recType = params['type'];
        let recId =  params['recid'];
        this.apiService.checkEditorPermission(recType, recId)
          .then(() => {
            return this.apiService.fetchRecord(recType, recId);
          }).then(record => {
            this.record = record['metadata'];
            this.config = this.appConfigService.getConfigForRecord(this.record);
            return this.apiService.fetchUrl(this.record['$schema']);
          }).then(schema => {
            this.schema = schema;
            this.changeDetectorRef.markForCheck();
          }).catch(error => {
            console.error(error);
            if (error.status === 403) {
              this.toastrService.error(`Logged in user can not access to the record: ${recType}/${recId}`, 'Forbidden');
            } else {
              this.toastrService.error('Could not load the record!', 'Error');
            }
          });
      });

    this.appConfigService.onConfigChange
      .subscribe(config => {
        this.config = Object.assign({}, config);
        this.changeDetectorRef.markForCheck();
      });
  }

  onRecordChange(record: Object) {
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
}
