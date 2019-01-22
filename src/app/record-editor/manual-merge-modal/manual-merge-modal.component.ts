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

import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { RecordApiService, DomUtilsService, GlobalAppStateService } from '../../core/services';
import { RecordRevision } from '../../shared/interfaces';
import { SubscriberComponent } from '../../shared/classes';
import { HOVER_TO_DISMISS_INDEFINITE_TOAST } from '../../shared/constants';

@Component({
  selector: 're-manual-merge-modal',
  templateUrl: './manual-merge-modal.component.html',
  styleUrls: [
    './manual-merge-modal.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualMergeModalComponent extends SubscriberComponent implements OnInit {
  @ViewChild('modal') modal: ModalDirective;

  updateRecordId: string;
  currentRecordType: string;

  private record: object;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private recordApiService: RecordApiService,
    private domUtilsService: DomUtilsService,
    private globalAppStateService: GlobalAppStateService) {
    super();
  }

  ngOnInit() {
    this.route.params
      .map(params => params['type'])
      .takeUntil(this.isDestroyed)
      .subscribe(recordType => {
        this.currentRecordType = recordType;
      });

    this.globalAppStateService
      .jsonBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe(jsonBeingEdited => {
        this.record = jsonBeingEdited;
      });
  }

  onMergeClick() {
    let infoToast = this.toastrService.info('Merging records...', 'Loading', HOVER_TO_DISMISS_INDEFINITE_TOAST);

    this.recordApiService
      .saveRecord(this.record)
      .switchMap(() => {
        return this.recordApiService.manualMerge(this.updateRecordId);
      }).subscribe(mergeWorkflowObjectId => {
        this.toastrService.clear(infoToast.toastId);
        this.router.navigate([`holdingpen/${mergeWorkflowObjectId}`]);
      }, () => {
        this.toastrService.clear(infoToast.toastId);
        this.toastrService.error('Could not merge!', 'Error');
      });
  }

  openUpdateRecordInNewTab() {
    this.domUtilsService.openHostRelativeUrlInNewTab(`${this.currentRecordType}/${this.updateRecordId}`);
  }

  // invoked by the parent
  show() {
    this.modal.show();
  }
}
