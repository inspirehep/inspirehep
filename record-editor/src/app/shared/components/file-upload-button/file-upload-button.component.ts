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

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JsonStoreService } from 'ng2-json-editor';
import { ToastrService } from 'ngx-toastr';

import { CommonApiService } from '../../../core/services';
import { HOVER_TO_DISMISS_INDEFINITE_TOAST } from '../../../shared/constants';

@Component({
  selector: 're-file-upload-button',
  templateUrl: './file-upload-button.component.html',
  styleUrls: ['./file-upload-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadButtonComponent {
  constructor(
    private apiService: CommonApiService,
    private jsonStoreService: JsonStoreService,
    private toastrService: ToastrService
  ) {}

  onFileSelect(file: File) {
    if (file) {
      let infoToast = this.toastrService.info(
        'Uploading file...',
        'Wait',
        HOVER_TO_DISMISS_INDEFINITE_TOAST
      );

      this.apiService.uploadFile(file).subscribe(
        uploadedPath => {
          this.jsonStoreService.addIn(['documents', '-'], {
            url: uploadedPath,
            key: file.name,
          });

          this.toastrService.clear(infoToast.toastId);
          this.toastrService.success(`File uploaded`, 'Success');
        },
        error => {
          this.toastrService.clear(infoToast.toastId);
          this.toastrService.error('Could not upload the file', 'Error!');
        }
      );
    }
  }
}
