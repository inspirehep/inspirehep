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

import { Component, OnInit } from '@angular/core';

import { ReplaySubject } from 'rxjs/ReplaySubject';

import { RecordSearchService } from '../../core/services';

@Component({
  selector: 're-record-search',
  templateUrl: './record-search.component.html',
  styleUrls: ['./record-search.component.scss']
})
export class RecordSearchComponent {

  searchExpression: string;
  recordIds: Array<number>;
  cursor: number;

  constructor(private recordSearchService: RecordSearchService) { }

  get searchResultCount$(): ReplaySubject<number> {
    return this.recordSearchService.resultCount$;
  }

  next() {
    this.cursor++;
    this.recordSearchService.setCursor(this.cursor);
  }

  previous() {
    this.cursor--;
    this.recordSearchService.setCursor(this.cursor);
  }

}
