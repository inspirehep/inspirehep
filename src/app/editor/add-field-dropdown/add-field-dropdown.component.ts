import { Component, Input, Output, EventEmitter } from '@angular/core';

import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { DifferentKeysPipe } from '../different-keys.pipe';

import { EmptyValueService } from '../empty-value.service'

@Component({
  selector: 'add-field-dropdown',
  directives: [DROPDOWN_DIRECTIVES],
  pipes: [DifferentKeysPipe],
  providers: [EmptyValueService],
  template: require('./add-field-dropdown.component.html'),
  styles: [
    require('./add-field-dropdown.component.scss')
  ]
})
export class AddFieldDropdownComponent  {

  @Input() schema: Object;
  @Input() record: Object;

  constructor(private emptyValueService: EmptyValueService) {
  
  }

  addFieldFromSchema(name: string) {
    let subSchema = this.schema[name];
    this.record[name] = this.emptyValueService.generateEmptyValue(subSchema);
  }

}