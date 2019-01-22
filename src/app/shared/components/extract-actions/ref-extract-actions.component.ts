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
import { HOVER_TO_DISMISS_INDEFINITE_TOAST } from '../../../shared/constants';

@Component({
  selector: 're-ref-extract-actions',
  templateUrl: './extract-actions.component.html',
  styleUrls: [
    './extract-actions.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefExtractActionsComponent {
  // text or url
  source: string;
  replaceExisting = true;

  constructor(private apiService: CommonApiService,
    private jsonStoreService: JsonStoreService,
    private toastrService: ToastrService) { }

  onExtractClick() {
    let infoToast = this.toastrService.info('Extracting references...', 'Loading', HOVER_TO_DISMISS_INDEFINITE_TOAST);

    this.apiService
      .refExtract(this.source, this.sourceType)
      .then(references => {
        if (this.replaceExisting) {
          this.jsonStoreService.setIn(['references'], references);
        } else {
          references.forEach(reference => {
            this.jsonStoreService.addIn(['references', 0], reference);
          });
        }

        this.toastrService.clear(infoToast.toastId);
        this.toastrService.success(`${references.length} references extracted.`, 'Success');
      }).catch(error => {
        this.toastrService.clear(infoToast.toastId);
        this.toastrService.error('Could not extract references', 'Error');
      });
  }

  get sourceType(): 'text' | 'url' {
    const isUrl = this.source.startsWith('http') && this.source.length < 2048;
    return isUrl ? 'url' : 'text';
  }

}
