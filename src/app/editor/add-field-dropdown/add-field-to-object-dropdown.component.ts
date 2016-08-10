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

import { Component, Input } from '@angular/core';

import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { DifferentKeysPipe } from '../shared/pipes';

import { EmptyValueService } from '../shared/services';

@Component({
  selector: 'add-field-dropdown',
  directives: [DROPDOWN_DIRECTIVES],
  pipes: [DifferentKeysPipe],
  providers: [EmptyValueService],
  styles: [
    require('./add-field-dropdown.component.scss')
  ],
  template: require('./add-field-dropdown.component.html')
})
export class AddFieldToObjectDropdownComponent {

  // 'propeties' of an object schema
  @Input() schema: Object;
  @Input() value: Object;

  constructor(private emptyValueService: EmptyValueService) {
  
  }

  addFieldFromSchema(name: string) {
    let subSchema = this.schema[name];
    this.value[name] = this.emptyValueService.generateEmptyValue(subSchema);
  }

}