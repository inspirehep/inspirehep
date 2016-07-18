import { Component, Input } from '@angular/core';

import { AbstractArrayFieldComponent } from '../abstract-array-field';
import { PrimitiveFieldComponent } from '../primitive-field';

import { MapToIterablePipe } from '../shared/pipes';

import { EmptyValueService } from '../shared/services';


@Component({
  selector: 'object-array-field',
  directives: [PrimitiveFieldComponent],
  pipes: [MapToIterablePipe],
  providers: [EmptyValueService],
  styles: [
    require('./object-array-field.component.scss')
  ],
  template: require('./object-array-field.component.html'),
})
export class ObjectArrayFieldComponent extends AbstractArrayFieldComponent {

  @Input() values: Array<Object>;
  @Input() schema: Object;

  constructor(public emptyValueService: EmptyValueService) {
    super()
  }

  /**
   * @override
   * Needs different logic, because this component may have flattened model.
   */
  get emptyValue(): Object {
    if (!this._emptyValue) {
      let copy = Object.assign({}, this.values[0]);
      Object.keys(copy)
        .filter(prop => copy[prop] != null)
        .forEach(prop => {
          let propSchema = this.getInnerSchema(prop);
          copy[prop] = this.emptyValueService.generateEmptyValue(propSchema);
        });
      this._emptyValue = copy;
    }
    return Object.assign({}, this._emptyValue);
  }

  /**
   * Returns inner schema of unflattened and flattened fields
   * 
   * @param {string} fieldPath - dot separated path of the field. EX: 'foo.bar'
   */
  private getInnerSchema(fieldPath: string): Object {
    let props = fieldPath.split('.');
    let subSchema = this.schema['items'];
    props.forEach(prop => {
      subSchema = subSchema['properties'][prop];
    });
    return subSchema
  }
}
