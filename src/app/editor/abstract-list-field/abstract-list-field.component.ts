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

import { AbstractFieldComponent } from '../abstract-field';

import { EmptyValueService } from '../shared/services';

/**
 * Abstract component to share code of common operations of all array fields
 * 
 * Instance properties declared here only to resolve syntax errors. 
 * Hence they need to be declared in children extending components (with decarators if necessary)
 */
export abstract class AbstractListFieldComponent extends AbstractFieldComponent {

  values: Array<any>;
  schema: Object;
  path: string;
  emptyValueService: EmptyValueService;
  protected _emptyValue: any;

  /**
   * Called when a property of any element of the values is changed
   * Used if values is a object array.
   * 
   * @param {any} event - new value
   * @param {number} index - index of changed element in array
   * @param {key} key - name of the changed property of the element in given index
   * 
   */
  onValueChange(event: any, index: number, key: string) {
    this.values[index][key] = event;
  }

  /**
   * @param {number} index - Index of the element that is moved
   * @param {number} direction - Movement direction. -1 for UP, +1 for DOWN
   */
  moveElement(index: number, direction: number) {
    let newIndex = index + direction;
    let temp = this.values[index];
    this.values[index] = this.values[newIndex];
    this.values[newIndex] = temp;
  }

  addNewElement() {
    this.values.push(this.emptyValue);
  }

  /**
   * Returns copy of empty value generated via schema.
   * At first caches the actual value for later use.
   * After returns a copy of the cache.
   */
  get emptyValue(): any {
    if (!this._emptyValue) {
      this._emptyValue = this.emptyValueService.generateEmptyValue(this.schema['items']);
    }
    // Return a copy if it is an object because objects are passed by reference.
    return (typeof this._emptyValue === 'object') ?
      Object.assign({}, this._emptyValue) : this._emptyValue;
  }

  /**
   * @param {number} index - Index of the element to be deleted
   */
  deleteElement(index: number) {
    this.values.splice(index, 1);
  }

  /**
   * Returns path of the property of an element at index.
   */
  getValuePath(index: number, property: string): string {
    return `${this.path}.${index}.${property}`;
  }
}
