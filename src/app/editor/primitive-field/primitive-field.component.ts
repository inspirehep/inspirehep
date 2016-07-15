import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'primitive-field',
  styles: [
    require('./primitive-field.component.scss')
  ],
  template: require('./primitive-field.component.html')
})
export class PrimitiveFieldComponent {
  
  @Input() value: string | number | boolean;

  @Output() onValueChange = new EventEmitter<any>();  

  get valueType(): string {
    return typeof this.value;
  }

}