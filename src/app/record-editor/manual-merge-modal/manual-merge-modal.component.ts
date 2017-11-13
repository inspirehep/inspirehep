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

import { RecordApiService, DomUtilsService } from '../../core/services';
import { RecordRevision } from '../../shared/interfaces';
import { SubscriberComponent } from '../../shared/classes';

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

  constructor(private router: Router,
    private route: ActivatedRoute,
    private recordApiService: RecordApiService,
    private domUtilsService: DomUtilsService) {
    super();
  }

  ngOnInit() {
    this.route.params
      .map(params => params['type'])
      .takeUntil(this.isDestroyed)
      .subscribe(recordType => {
        this.currentRecordType = recordType;
      });
  }

  onMergeClick() {
    this.recordApiService
      .manualMerge(this.updateRecordId)
      .then(mergeWorkflowObjectId => {
        this.router.navigate([`holdingpen/${mergeWorkflowObjectId}`]);
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
