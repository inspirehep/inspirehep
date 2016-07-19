import { Component, Input, Output, EventEmitter } from '@angular/core';

import { SchemaValidationService } from '../shared/services';

@Component({
  selector: 'primitive-field',
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
    this.onValueChange.emit(event);
    // Validation
    if (this.schema['type'] === 'string') {
      try {
        this.schemaValidationService.validateStringValue(this.value.toString(), this.schema);
        this.error = undefined;
      } catch (error) {
        this.error = error;
        console.error(error);
      }
    }
  }

  get valueType(): string {
    return typeof this.value;
  }

  getErrorClass() {
    return {
      'has-error': this.error !== undefined
    };
  }

}