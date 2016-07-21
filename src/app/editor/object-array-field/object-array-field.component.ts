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
import { PrimitiveFieldComponent } from '../primitive-field';

import { MapToIterablePipe } from '../shared/pipes';

import { EmptyValueService } from '../shared/services';


@Component({
  selector: 'object-array-field',
  directives: [PrimitiveFieldComponent],
  pipes: [MapToIterablePipe],
  providers: [EmptyValueService],
  styles: [
    require('./object-array-field.component.scss')
  ],
  template: require('./object-array-field.component.html'),
})
export class ObjectArrayFieldComponent extends AbstractArrayFieldComponent {

  @Input() values: Array<Object>;
  @Input() schema: Object;

  constructor(public emptyValueService: EmptyValueService) {
    super()
  }

  /**
   * @override
   * Needs different logic, because this component may have flattened model.
   */
  get emptyValue(): Object {
    if (!this._emptyValue) {
      let copy = Object.assign({}, this.values[0]);
      Object.keys(copy)
        .filter(prop => copy[prop] != null)
        .forEach(prop => {
          let propSchema = this.getInnerSchema(prop);
          copy[prop] = this.emptyValueService.generateEmptyValue(propSchema);
        });
      this._emptyValue = copy;
    }
    return Object.assign({}, this._emptyValue);
  }

  /**
   * Returns inner schema of unflattened and flattened fields
   * 
   * @param {string} fieldPath - dot separated path of the field. EX: 'foo.bar'
   */
  private getInnerSchema(fieldPath: string): Object {
    let props = fieldPath.split('.');
    let subSchema = this.schema['items'];
    props.forEach(prop => {
      subSchema = subSchema['properties'][prop];
    });
    return subSchema
  }
}
