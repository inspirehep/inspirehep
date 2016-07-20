import { Component, Input } from '@angular/core';

import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import { DifferentKeysPipe } from '../shared/pipes';

import { EmptyValueService } from '../shared/services';

@Component({
  selector: 'add-field-dropdown',
  directives: [DROPDOWN_DIRECTIVES],
  pipes: [DifferentKeysPipe],
  providers: [EmptyValueService],
  styles: [
    require('./add-field-dropdown.component.scss')
  ],
  template: require('./add-field-dropdown.component.html')
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