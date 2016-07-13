import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AbstractTrackerComponent } from '../abstract-tracker';

@Component({
  selector: 'string-array-field',
  styles: [
    require('./string-array-field.component.scss')
  ],
  template: require('./string-array-field.component.html'),

})
export class StringArrayFieldComponent extends AbstractTrackerComponent {

  @Input() values: Array<string>;

  /**
   * Event emitter to bind changes in the component to the model of parent component
   * RELATED: http://stackoverflow.com/questions/34608814/bidirectional-data-binding-on-a-component-input-property/34616530#34616530 
   */
  @Output() valueChangeEmitter: EventEmitter<string> = new EventEmitter<string>();

  valueChange(event: any, index: number) {
    this.values[index] = event;
    this.valueChangeEmitter.emit(event);
  }

  /**
   * @param {number} index - Index of the row that is moved
   * @param {number} direction - Movement direction. -1 for UP, +1 for DOWN
   */
  moveElement(index: number, direction: number) {
    let newIndex = index + direction;
    let temp = this.values[index];
    this.values[index] = this.values[newIndex];
    this.values[newIndex] = temp;
  }

  /**
   * @param {number} index - Index of the row to be deleted
   */
  deleteElement(index: number) {
    this.values.splice(index, 1);
  }

  addNewElement() {
    this.values.push('');
  }

}
