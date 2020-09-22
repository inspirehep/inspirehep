/*
 * This file is part of ng2-multi-record-editor.
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

import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SchemaKeysStoreService } from '../shared/services/schema-keys-store.service';
import { Action } from '../shared/interfaces';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 're-addition-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss']
})
export class AddActionComponent {
  @Input() action: Action;
  isEditorVisible = false;
  isInputField = false;
  subSchema: object;
  record = {};

  constructor(private schemaKeysStoreService: SchemaKeysStoreService,
    private toastr: ToastrService) { }

  saveRecord(record: object) {
    // if user is adding a premitive key return only the value
    this.action.value = this.subSchema['alwaysShow'] ? record[Object.keys(record)[0]] : record;
  }

  closeEditor() {
    this.isEditorVisible = false;
    this.action.value = {};
  }

  onValueChange(value: string) {
    this.action.mainKey = value;
    this.subSchema = this.schemaKeysStoreService.findSubSchema(this.action.mainKey);
    this.action.value = {};
  }

  openEditor() {
    if (!this.action.mainKey) {
      this.toastr.error('Choose a key for the field to be added');
    } else if (!this.subSchema) {
      this.toastr.error('Choose a key using autocompletion values for the field to be added');
    } else {
      this.isEditorVisible = true;
    }
  }
}
