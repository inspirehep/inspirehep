import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MapToIterablePipe } from '../map-to-iterable.pipe';
import { AbstractTrackerComponent } from '../abstract-tracker';

@Component({
  selector: 'array-field',
  pipes: [MapToIterablePipe],
  template: require('./array-field.component.html'),
  styles: [
    require('./array-field.component.scss')
  ]
})
export class ArrayFieldComponent extends AbstractTrackerComponent {

  /**
   * Array of objects
   * where each property of the object is subfield name
   */
  @Input() values: {}[];
  @Input() schema: {};
  
  /**
   * Event emitter to bind changes in the component to the model of parent component
   * RELATED: http://stackoverflow.com/questions/34608814/bidirectional-data-binding-on-a-component-input-property/34616530#34616530 
   */
  @Output() valueChangeEmitter: EventEmitter<string> = new EventEmitter<string>();

  valueChange(event: any, index: number, key: string) {
    this.values[index][key] = event;
    this.valueChangeEmitter.emit(event);
  }

  onAddNewElement() {
    this.values.push({});
  }

  ngOnInit() {

  }
}