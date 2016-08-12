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

import { AbstractTrackerComponent } from '../abstract-tracker';
import { AddFieldToObjectDropdownComponent } from '../add-field-dropdown';
import { PrimitiveFieldComponent } from '../primitive-field'

import { MapToSortedIterablePipe } from '../shared/pipes';

@Component({
  selector: 'object-field',
  directives: [AddFieldToObjectDropdownComponent, PrimitiveFieldComponent],
  pipes: [MapToSortedIterablePipe],
  styles: [
    require('./object-field.component.scss')
  ],
  template: require('./object-field.component.html')
})
export class ObjectFieldComponent extends AbstractTrackerComponent {

  @Input() value: Object;
  @Input() schema: Object;

  onValueChange(event: any, key: string) {
    this.value[key] = event;
  }

  deleteField(name: string) {
    delete this.value[name];
  }
}
