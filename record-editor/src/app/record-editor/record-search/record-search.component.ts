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

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { RecordSearchService } from '../../core/services';
import { SearchParams } from '../../shared/interfaces';
import { SubscriberComponent } from '../../shared/classes';

interface RouteType {
  params: { type: string };
  queryParams: SearchParams;
}

@Component({
  selector: 're-record-search',
  templateUrl: './record-search.component.html',
  styleUrls: ['./record-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordSearchComponent extends SubscriberComponent
  implements OnInit {
  recordType: string;
  recordCursor: number;
  foundRecordIds: Array<number>;

  constructor(
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private recordSearchService: RecordSearchService
  ) {
    super();
  }

  ngOnInit() {
    this.recordSearchService.cursor$
      .takeUntil(this.isDestroyed)
      .subscribe(cursor => {
        this.recordCursor = cursor;
        this.changeDetectorRef.markForCheck();
      });

    const searchSub = Observable.combineLatest(
      this.route.params,
      this.route.queryParams,
      (params, queryParams) => {
        return { params, queryParams };
      }
    )
      .do((route: RouteType) => {
        this.recordType = route.params.type;
      })
      .filter((route: RouteType) => Boolean(route.queryParams.query))
      .switchMap((route: RouteType) =>
        this.recordSearchService.search(
          route.params.type,
          route.queryParams.query
        )
      )
      .takeUntil(this.isDestroyed)
      .subscribe(recordIds => {
        this.foundRecordIds = recordIds;
        this.changeDetectorRef.markForCheck();
      });
  }
}
