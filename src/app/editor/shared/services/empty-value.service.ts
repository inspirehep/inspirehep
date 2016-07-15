import { Injectable } from '@angular/core';

@Injectable()
export class EmptyValueService {

  private static defaultValueLookup = {
    'string': '',
    'boolean': false,
    'integer': 0,
    'number': 0,
  }
  generateEmptyValue(schema: Object): any {
    if (schema['type'] === 'object') {
      let emptyObject = {};
      Object.keys(schema['properties'])
        .forEach(prop => {
          let propSchema = schema['properties'][prop];
          emptyObject[prop] = this.generateEmptyValue(propSchema);
        });
      return emptyObject;
    }
    if (schema['type'] === 'array') {
      let emptyArray = [];
      let arrayElementSchema = schema['items'];
      emptyArray.push(this.generateEmptyValue(arrayElementSchema));
      return emptyArray;
    }
    return EmptyValueService.defaultValueLookup[schema['type']];
  }

}