import { Injectable } from '@angular/core';

@Injectable()
export class SchemaValidationService {
  
  private static formatRegexps = {
    date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
    email: /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
    isbn: /^ISBN\s(?=[-0-9xX ]{13}$)(?:[0-9]+[- ]){3}[0-9]*[xX0-9]$/,
  }
  
  /**
   * Validate string value against schema
   * 
   * @throws {Error} if value can not be validated
   * 
   * Checks: format
   * 
   */
  validateStringValue(value: string, schema: Object) {
    let schemaFormat = schema['format'];
    if (schemaFormat) {
      // can be labelled format (email, datae etc.) or regexp format
      let formatRegexp = SchemaValidationService.formatRegexps[schemaFormat] || schemaFormat;
      if (!value.match(formatRegexp)) {
        throw Error(`Does not match with format: ${schemaFormat}`);
      }
    }
  }

  /**
   * Validate array value against schema
   * 
   * @throws {Error} if array can not be validated
   * 
   * Checks: uniqueItems
   * 
   */
  validateArray(array: Array<any>, schema) {
    if (schema['uniqueItems']) {
      let hasUniqueItems = (new Set(array)).size === array.length;
      if (hasUniqueItems) {
        throw Error(`All items must be unique`);
      }
    }
  }


}