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

import { AbstractArrayFieldComponent } from '../abstract-array-field';
import { AddFieldDropdownComponent } from '../add-field-dropdown';
import { ObjectFieldComponent } from '../object-field';
import { ObjectArrayFieldComponent } from '../object-array-field';
import { PrimitiveArrayFieldComponent } from '../primitive-array-field';
import { PrimitiveFieldComponent } from '../primitive-field';

import { MapToIterablePipe } from '../shared/pipes';

import { EmptyValueService, JsonUtilService } from '../shared/services';

@Component({
  selector: 'array-in-array-field',
  directives: [
    AddFieldDropdownComponent,
    ObjectFieldComponent,
    ObjectArrayFieldComponent,
    PrimitiveFieldComponent,
    PrimitiveArrayFieldComponent
  ],
  pipes: [MapToIterablePipe],
  providers: [EmptyValueService, JsonUtilService],
  styles: [
    require('./array-in-array-field.component.scss')
  ],
  template: require('./array-in-array-field.component.html')
})
export class ArrayInArrayFieldComponent extends AbstractArrayFieldComponent {

  @Input() values: Array<Object>;
  @Input() schema: Object;

  constructor(public emptyValueService: EmptyValueService, private jsonUtilService: JsonUtilService) {
    super();
  }

  getType(value: any): string {
    return this.jsonUtilService.getType(value);
  }
}
