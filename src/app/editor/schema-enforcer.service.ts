import { Injectable } from '@angular/core';

@Injectable()
export class SchemaEnforcerService {

  constructor() {

  }

  /**
   * This enforces schema rulest to the record
   */
  enforceSchema(record: {}, schema: {}): {} {
    return this.fixArrayHeaders(record, schema);
  }

  /**
   * This inserts empty element with all possible subfields from the schema
   * into the beginning of the array fields
   */
  private fixArrayHeaders(record: {}, schema: {}): {} {
    Object.keys(schema).filter(prop => (schema[prop].items != null && schema[prop].items.properties != null))
      .forEach((prop) => {
        const itemProperties = schema[prop].items.properties;
        let headerElement = {};
        Object.keys(itemProperties).forEach(itemProp => {
          headerElement[itemProp] = ' ';
        });
        if (record[prop] == null) {
          record[prop] = [];
        }
        record[prop].unshift(headerElement);
      });
    return record;
  }
}