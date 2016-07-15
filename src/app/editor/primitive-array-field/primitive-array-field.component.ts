import { Component, Input } from '@angular/core';

import { AbstractArrayFieldComponent } from '../abstract-array-field';
import { PrimitiveFieldComponent } from '../primitive-field';


@Component({
  selector: 'primitive-array-field',
  directives: [PrimitiveFieldComponent],
  styles: [
    require('./primitive-array-field.component.scss')
  ],
  template: require('./primitive-array-field.component.html'),

})
// FIXME: this doesn't have all stuff of AbstractArrayFieldComponent. Maybe, it shouldn't extend it.
export class PrimitiveArrayFieldComponent extends AbstractArrayFieldComponent {

  @Input() values: Array<any>;
  @Input() schema: Object;
  
  /**
   * Called when any element of is changed of the values is changed
   * @override
   * 
   * It casts new value to appropriate type.
   * 
   * @param {any} event - new value
   * @param {number} index - index of changed element in array
   * 
   */
  onValueChange(event: any, index: number) {
    this.values[index] = event;
  }

  addNewElement() {
    this.values.push('');
  }

}
