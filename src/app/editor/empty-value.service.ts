import { Injectable } from '@angular/core';

@Injectable()
export class EmptyValueService {

  generateEmptyValue(schema: Object): any {
    if (schema['type'] === 'object') {
      return {}
    } 

    if (schema['type'] === 'array') {
      let emptyArray = [];
      let arrayElementType = schema['items']['type'];
      emptyArray.push(this.generateEmptyValue(arrayElementType));
      return emptyArray;
    }

    return '';
  }

}