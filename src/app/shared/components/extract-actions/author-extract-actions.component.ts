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

import { Component, Input, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { JsonStoreService } from 'ng2-json-editor';

import { CommonApiService } from '../../../core/services';

@Component({
  selector: 're-author-extract-actions',
  templateUrl: './extract-actions.component.html',
  styleUrls: [
    './extract-actions.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorExtractActionsComponent {

  source: string;
  replaceExisting = true;

  constructor(private apiService: CommonApiService,
    private jsonStoreService: JsonStoreService,
    private toastrService: ToastrService) { }

  onExtractClick() {
    let infoToast = this.toastrService.info('Extracting authors...', 'Wait', { timeOut: 0, onActivateTick: true });

    this.apiService
      .authorExtract(this.source)
      .then(authors => {
        if (this.replaceExisting) {
          this.jsonStoreService.setIn(['authors'], authors);
        } else {
          authors.forEach(author => {
            this.jsonStoreService.addIn(['authors', 0], author);
          });
        }

        this.toastrService.clear(infoToast.toastId);
        this.toastrService.success(`${authors.length} authors extracted.`, 'Success');
      }).catch(error => {
        this.toastrService.clear(infoToast.toastId);
        this.toastrService.error('Could not extract authors', 'Error');
      });
  }

}
