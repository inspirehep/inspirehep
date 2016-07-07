import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MapToIterablePipe } from '../map-to-iterable.pipe';

import { JsonUtilService } from '../json-util.service';

import { AbstractTrackerComponent } from '../abstract-tracker';
import { ObjectFieldComponent } from '../object-field';
import { ObjectArrayFieldComponent } from '../object-array-field';
import { StringArrayFieldComponent } from '../string-array-field';

@Component({
  selector: 'array-in-array-field',
  directives: [ObjectFieldComponent, ObjectArrayFieldComponent, StringArrayFieldComponent],
  pipes: [MapToIterablePipe],
  template: require('./array-in-array-field.component.html'),
  styles: [
    require('./array-in-array-field.component.scss')
  ]
})
export class ArrayInArrayFieldComponent extends AbstractTrackerComponent {

  @Input() values: Array<Object>;

  /**
   * Event emitter to bind changes in the component to the model of parent component
   * RELATED: http://stackoverflow.com/questions/34608814/bidirectional-data-binding-on-a-component-input-property/34616530#34616530 
   */
  @Output() valueChangeEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(private jsonUtilService: JsonUtilService) {
    super();
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
    throw new Error('Not yet implemented');
  }

  valueChange(event: any, index: number, key: string) {
    this.values[index][key] = event;
    this.valueChangeEmitter.emit(event);
  }

  getType(value: any): string {
    return this.jsonUtilService.getType(value);
  }
}
