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

import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RecordService } from '../shared/services';
import 'rxjs/add/operator/mergeMap';

import { APP_CONFIG } from '../app.config';

@Component({
  selector: 're-editor-container',
  templateUrl: './editor-container.component.html'
})
export class EditorContainerComponent implements OnInit {
  private config: Object = {};
  private record: Object;
  private schema: Object;

  constructor(private route: ActivatedRoute, private recordService: RecordService, @Inject(APP_CONFIG) config: AppConfig) {
    this.config = config;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      let record;
      this.recordService.fetchRecord(params['type'], params['recid'])
        .flatMap(fetched => {
          record = fetched;
          return this.recordService.fetchSchema(record['$schema']);
        }).subscribe(schema => {
          this.record = record;
          this.schema = schema;
        }, error => console.error(error));
    });
    }

  onRecordChange(record: Object) {
        this.record = record;
      }
}
