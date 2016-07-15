import { Injectable } from '@angular/core';
import { EmptyValueService } from './empty-value.service';

@Injectable()
export class RecordFixerService {

  private emptyValueService: EmptyValueService = new EmptyValueService();
  
  /**
   * Fixes the record for the better UI appearance.
   * Makes use of schema to get types
   */
  fixRecord(record: Object, schema: Object) {
    Object.keys(schema).filter(field => record[field])
      .forEach(field => {
        // TODO: use getType
        if (schema[field].type === 'array' && schema[field].items.properties) {
          // Check if the array field has any property that is also an array. (Arrayception)
          let subSchema = schema[field].items.properties;
          let hasAnyArrayFields = Object.keys(subSchema)
            .some(subField => subSchema[subField].type === 'array');
          if (!hasAnyArrayFields) {
            // This field will be represented as a table (ObjectArray)
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
  private insertEmptyForMissingFields(record: Array<Object>, schema: Object) {
    Object.keys(schema).forEach(field => {
      record.filter(element => element[field] == null)
        .forEach(element => {
          element[field] = this.emptyValueService.generateEmptyValue(schema[field]);
        });
    });
  }
}