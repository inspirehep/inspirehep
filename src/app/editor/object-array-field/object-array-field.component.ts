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
  private _emptyValue: {};
  
  constructor(public emptyValueService: EmptyValueService) {
    super()
  }

  addNewElement() {
    let emptyValue = this.emptyValueService.generateEmptyValue(this.schema['items']);
    this.values.push(emptyValue);
  }

  /**
   * Assigns null values to the properties of the copy of an element
   * and caches it in a private instance variable.
   */
  private get emptyValue(): Object {
    if (!this._emptyValue) {
      let copy = Object.assign({}, this.values[0]);
      Object.keys(copy)
        .filter(prop => copy[prop] != null)
        .forEach(prop => {
          copy[prop] = undefined;
        });
      this._emptyValue = copy;
    }
    return this._emptyValue;
  }
}
