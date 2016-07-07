import { Injectable } from '@angular/core';

@Injectable()
export class SchemaEnforcerService {

  /**
   * Enforces schema rules to the record
   */
  enforceSchema(record: {}, schema: {}) {
    Object.keys(schema).filter(field => record[field])
      .forEach(field => {
        if (schema[field].type === 'array' && schema[field].items.properties) {
          // Check if the array field has any property that is also an array. (Arrayception)
          let subSchema = schema[field].items.properties;
          let hasAnyArrayFields = Object.keys(subSchema)
            .some(subField => subSchema[subField].type === 'array');
          if (!hasAnyArrayFields) {
            // This field will be represented as a table.
            // So insert empty values for missing subfields to fix table.
            this.insertEmptyForMissingFields(record[field], subSchema);
          }
        }
      });
  }

  /**
   * Insert empty values for fields that are in the schema
   * but not present in given record
   *
   */
  private insertEmptyForMissingFields(record: [{}], schema: {}) {
    Object.keys(schema).forEach(field => {
      record.filter(element => element[field] == null)
        .forEach(element => {
          element[field] = '';
        });
    });
  }
}