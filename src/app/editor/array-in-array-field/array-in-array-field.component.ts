import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AbstractTrackerComponent } from '../abstract-tracker';
import { AddFieldDropdownComponent } from '../add-field-dropdown';
import { ObjectFieldComponent } from '../object-field';
import { ObjectArrayFieldComponent } from '../object-array-field';
import { StringArrayFieldComponent } from '../string-array-field';

import { MapToIterablePipe } from '../shared/pipes';

import { JsonUtilService } from '../shared/services';

@Component({
  selector: 'array-in-array-field',
  providers: [JsonUtilService],
  directives: [
    AddFieldDropdownComponent,
    ObjectFieldComponent,
    ObjectArrayFieldComponent,
    StringArrayFieldComponent
  ],
  pipes: [MapToIterablePipe],
  styles: [
    require('./array-in-array-field.component.scss')
  ],
  template: require('./array-in-array-field.component.html')
})
export class ArrayInArrayFieldComponent extends AbstractTrackerComponent {

  @Input() values: Array<Object>;
  @Input() schema: Object;

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
