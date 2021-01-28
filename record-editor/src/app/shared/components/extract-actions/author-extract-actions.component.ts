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
  Input,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { ToastrService, ActiveToast } from 'ngx-toastr';
import { JsonStoreService } from 'ng2-json-editor';

import { CommonApiService } from '../../../core/services';
import { ApiError } from '../../../shared/classes';
import { AuthorExtractResult } from '../../../shared/interfaces';
import {
  DISMISSIBLE_INDEFINITE_TOAST,
  HOVER_TO_DISMISS_INDEFINITE_TOAST,
} from '../../../shared/constants';

@Component({
  selector: 're-author-extract-actions',
  templateUrl: './extract-actions.component.html',
  styleUrls: ['./extract-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorExtractActionsComponent {
  source: string;
  replaceExisting = true;
  extractingToast: ActiveToast;
  helpLink = '/tools/authorlist';

  constructor(
    private apiService: CommonApiService,
    private jsonStoreService: JsonStoreService,
    private toastrService: ToastrService
  ) {}

  onExtractClick() {
    this.extractingToast = this.toastrService.info(
      'Extracting authors...',
      'Loading',
      HOVER_TO_DISMISS_INDEFINITE_TOAST
    );

    this.apiService.authorExtract(this.source).subscribe(
      (authors) => this.onExtract(authors),
      (error) => this.onError(error)
    );
  }

  private onExtract(result: AuthorExtractResult) {
    const authors = result.authors;
    if (this.replaceExisting) {
      this.jsonStoreService.setIn(['authors'], authors);
    } else {
      authors.forEach((author) => {
        this.jsonStoreService.addIn(['authors', 0], author);
      });
    }

    this.toastrService.clear(this.extractingToast.toastId);
    const warnings = result.warnings;
    if (warnings && warnings.length > 0) {
      warnings.forEach((warning) => {
        this.toastrService.warning(
          warning,
          'Warning',
          DISMISSIBLE_INDEFINITE_TOAST
        );
      });
    }
    this.toastrService.success(
      `${authors.length} authors extracted.`,
      'Success'
    );
  }

  private onError(error: ApiError) {
    this.toastrService.clear(this.extractingToast.toastId);
    if (error.status === 400 && error.message) {
      this.toastrService.error(
        error.message,
        'Error',
        DISMISSIBLE_INDEFINITE_TOAST
      );
    } else {
      this.toastrService.error('Could not extract authors', 'Error');
    }
  }
}
