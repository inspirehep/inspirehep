/*
 * This file is part of record-editor.
 * Copyright (C) 2018 CERN.
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

import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { JsonStoreService } from 'ng2-json-editor';

import { CommonApiService } from '../../../core/services';
import { ToastrService } from 'ngx-toastr';
import { HOVER_TO_DISMISS_INDEFINITE_TOAST } from '../../constants';


@Component({
  selector: 're-link-references-button',
  templateUrl: './link-references-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkReferencesButtonComponent {

  constructor(private apiService: CommonApiService,
    private jsonStoreService: JsonStoreService,
    private toastrService: ToastrService) { }

  onLinkButtonClick() {
    let infoToast = this.toastrService.info('Linking references...', 'Loading', HOVER_TO_DISMISS_INDEFINITE_TOAST);

    const references = this.jsonStoreService.getIn(['references']);
    this.apiService.getLinkedReferences(references)
      .then(linkedReferences => {
        this.jsonStoreService.setIn(['references'], linkedReferences);

        this.toastrService.clear(infoToast.toastId);
        this.toastrService.success(`References are linked.`, 'Success');
      }).catch(error => {
        this.toastrService.clear(infoToast.toastId);
        this.toastrService.error('Could not link references', 'Error');
      });
  }
}
