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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../shared/services';

import { AppConfigService } from '../app-config.service';

@Component({
  templateUrl: './editor-container.component.html',
  styleUrls: [
    './editor-container.component.scss'
  ]
})
export class EditorContainerComponent implements OnInit {
  record: Object;
  schema: Object;
  private config: Object;

  constructor(private route: ActivatedRoute,
    private apiService: ApiService,
    private appConfig: AppConfigService) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.apiService.fetchRecord(params['type'], params['recid'])
          .then(record => {
            this.record = record['metadata'];
            this.config = this.appConfig.getConfigForRecord(this.record);
            return this.apiService.fetchUrl(this.record['$schema']);
          }).then(schema => {
            this.schema = schema;
          }).catch(error => console.error(error));
      });
  }

  onRecordChange(record: Object) {
    this.record = record;
  }

  /**
   * Utility function to check if array is defined and has at least single element inside
   * Used to simplify template
   */
  isEmpty(array: Array<any>): boolean {
    return array && array.length > 0;
  }
}
