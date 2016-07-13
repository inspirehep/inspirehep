import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MapToIterablePipe } from '../shared/pipes';
import { AbstractTrackerComponent } from '../abstract-tracker';

@Component({
  selector: 'object-array-field',
  pipes: [MapToIterablePipe],
  styles: [
    require('./object-array-field.component.scss')
  ],
  template: require('./object-array-field.component.html'),
})
export class ObjectArrayFieldComponent extends AbstractTrackerComponent {

  @Input() values: Array<Object>;
  private _emptyValue: {};
  
  /**
   * Event emitter to bind changes in the component to the model of parent component
   * RELATED: http://stackoverflow.com/questions/34608814/bidirectional-data-binding-on-a-component-input-property/34616530#34616530 
   */
  @Output() valueChangeEmitter: EventEmitter<string> = new EventEmitter<string>();

  valueChange(event: any, index: number, key: string) {
    this.values[index][key] = event;
    this.valueChangeEmitter.emit(event);
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

  /**
   * @param {number} index - Index of the element to be deleted
   */
  deleteElement(index: number) {
    this.values.splice(index, 1);
  }

  addNewElement() {
    this.values.push(this.emptyValue);
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
          copy[prop] = null;
        });
      this._emptyValue = copy;
    }
    return this._emptyValue;
  }
}
