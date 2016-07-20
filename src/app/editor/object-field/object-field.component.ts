import { Component, Input } from '@angular/core';

import { AbstractTrackerComponent } from '../abstract-tracker';
import { AddFieldDropdownComponent } from '../add-field-dropdown';

import { MapToIterablePipe } from '../shared/pipes';

@Component({
  selector: 'object-field',
  directives: [AddFieldDropdownComponent],
  pipes: [MapToIterablePipe],
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
