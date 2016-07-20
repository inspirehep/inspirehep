import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SearchableDropdownComponent } from '../searchable-dropdown';

import { SchemaValidationService } from '../shared/services';

@Component({
  selector: 'primitive-field',
  directives: [SearchableDropdownComponent],
  providers: [SchemaValidationService],
  styles: [
    require('./primitive-field.component.scss')
  ],
  template: require('./primitive-field.component.html')
})
export class PrimitiveFieldComponent {

  @Input() value: string | number | boolean;
  @Input() schema: Object;
  error: Error;

  @Output() onValueChange = new EventEmitter<any>();

  constructor(private schemaValidationService: SchemaValidationService) {

  }

  onModelChange(event: any) {
    // Validation
    if (this.schema['type'] === 'string' && this.schema['enum'] == null) {
      try {
        this.schemaValidationService.validateStringValue(event.toString(), this.schema);
      } catch (error) {
        console.error(error);
      }
    }
    // TODO: should we make the change even if it is not validated
    this.onValueChange.emit(event);
  }

  get valueType(): string {
    return typeof this.value;
  }

  ngOnInit() {
    // TODO: remove default after flattened records' schema problem is resolved
   this.schema = this.schema || {}
  }
}