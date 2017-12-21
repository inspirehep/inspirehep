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

import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ReplaySubject } from 'rxjs/ReplaySubject';

import { RecordSearchService, SavePreviewModalService, GlobalAppStateService } from '../../core/services';
import { SearchParams } from '../../shared/interfaces';
import { SubscriberComponent } from '../../shared/classes';

@Component({
  selector: 're-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent extends SubscriberComponent implements OnInit {

  record: object;

  recordType: string;
  query: string;
  cursor: number;
  resultCount: number;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private globalAppStateService: GlobalAppStateService,
    private recordSearchService: RecordSearchService,
    private savePreviewModalService: SavePreviewModalService) {
    super();
  }

  ngOnInit() {
    this.recordSearchService.cursor$
      .takeUntil(this.isDestroyed)
      .subscribe(cursor => {
        this.cursor = cursor;
      });

    this.recordSearchService.resultCount$
      .takeUntil(this.isDestroyed)
      .subscribe(resultCount => {
        this.resultCount = resultCount;
      });

    this.route.queryParams
      .takeUntil(this.isDestroyed)
      .subscribe((params: SearchParams) => {
        this.query = params.query;
      });

    this.route.params
      .takeUntil(this.isDestroyed)
      .subscribe(params => {
        this.recordType = params['type'];
      });

    this.route.params
      .filter(params => params['recid'])
      .takeUntil(this.isDestroyed)
      .subscribe((params) => {
        this.query = params['recid'];
        // clear search when routed to a record directly
        this.recordSearchService.resultCount$.next(undefined);
      });
    this.globalAppStateService
      .jsonBeingEdited$
      .takeUntil(this.isDestroyed)
      .subscribe(jsonBeingEdited => {
        this.record = jsonBeingEdited;
      });
  }

  searchOrGo() {
    const query = this.query;
    const isQueryNumber = !isNaN(+query);
    if (isQueryNumber) {
      this.router.navigate([`${this.recordType}/${query}`]);
    } else {
      this.router.navigate([`${this.recordType}/search`], { queryParams: { query } });
    }
  }

  onNextClick() {
    this.savePreviewModalService.displayModal({
      record: this.record,
      onCancel: () => this.next(),
      onConfirm: () => this.next()
    });
  }

  onPreviewClick() {
    this.savePreviewModalService.displayModal({
      record: this.record,
      onCancel: () => this.previous(),
      onConfirm: () => this.previous()
    });
  }

  private next() {
    this.cursor++;
    this.recordSearchService.setCursor(this.cursor);
  }

  private previous() {
    this.cursor--;
    this.recordSearchService.setCursor(this.cursor);
  }

}
