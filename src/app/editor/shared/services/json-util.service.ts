import { Injectable } from '@angular/core';

/**
 * WARNING: this doesn't work when the root json object is an array!
 * TODO: make these custom rxjs operator
 */
@Injectable()
export class JsonUtilService {
  /**
   * TODO: add example input and output to the function doc!
   * 
   * @param {{}} jsonObject - The marc json object to be flattened.
   */
  flattenMARCJson(jsonObject: {}): {} {
    return this.modifyMARCJson(jsonObject, new JsonFlattener());
  }

  /**
   * TODO: add example input and output to the function doc!
   * 
   * @param {{}} jsonObject - The marc json object to be unflattened.
   */
  unflattenMARCJson(jsonObject: {}): {} {
    return this.modifyMARCJson(jsonObject, new JsonUnFlattener());
  }

  /**
   * This skips top level properties (MARC fields) and array type properties of the top level properties (MARC subfields with collection)
   * and apply the given operator to all the rest.
   * 
   * @param {{}} jsonObject - The march json object to be flattened.
   * @param {JsonOperator} jsonOperator - The operator to be applied to given json object
   */
  private modifyMARCJson(jsonObject: {}, jsonOperator: JsonOperator) {
    const result = {};
    // TODO: create multiple instances inside forEach function if this operation should be parallel
    Object.keys(jsonObject)
      .forEach(prop => {
        switch (jsonObject[prop].constructor.name) {
          case 'Array':
            if (this.hasArrayProperty(jsonObject[prop][0]) || this.isNotObjectArray(jsonObject[prop])) {
              // ArrayInArray or Primitive
              // Do not flatten
              result[prop] = jsonObject[prop];
            } else {
              // ObjectArray
              // Do not apply the top level array, but apply its elements
              result[prop] = [];
              jsonObject[prop].forEach((object, i) => {
                result[prop][i] = jsonOperator.apply(object);
              });
            }
            break;
          case 'Object':
            result[prop] = jsonOperator.apply(jsonObject[prop]);
            break;
          default:
            result[prop] = jsonObject[prop];

        }
      });
    return result;
  }
  
  /**
   * Returns type of the given value. If it is not an array it returns the exact type.
   * CUSTOM ARRAY TYPES: PrimitiveArray, ArrayInArray, ObjectArray
   * 
   * TODO: move this utitiliy somewhere else.
   * 
   * @param {any} value - value to be evaluated.
   */
  public getType(value: any): string {
    let valueType = value.constructor.name;
    if (valueType === 'Array') {
      if (this.isNotObjectArray(value)) {
        return 'PrimitiveArray';
      } else if (this.hasArrayProperty(value[0])) {
        return 'ArrayInArray';
      }
      return 'ObjectArray';
    }
    return valueType;
  }

  private hasArrayProperty(json: Object): boolean {
    return Object.keys(json)
      .some(prop => json[prop].constructor && json[prop].constructor.name === 'Array');
  }

  private isNotObjectArray(arr: Array<any>): boolean {
    return arr.every(element => typeof element !== 'object');
  }
}


/**
 * Single function utility interface
 */
interface JsonOperator {
  apply(jsonObject: {});
}

/**
 * Single function utility class for flattening a json object
 * 
 * @extends JsonOperator
 */
class JsonFlattener implements JsonOperator {
  private result: {};

  /**
   * @param {{}} jsonObject - The json object to be flattened. 
   */
  apply(jsonObject: {}): {} {
    this.result = {};
    this.recurse(jsonObject, '');
    return this.result
  }

  private recurse(cur, prop) {
    switch (cur.constructor.name) {
      case 'Array':
        if (cur.length === 0) {
          this.result[prop] = [];
        } else {
          cur.forEach((el, i) => this.recurse(el, prop ? `${prop}.${i}` : `${i}`));
        }
        break;
      case 'Object':
        const keys = Object.keys(cur);
        if (keys.length === 0) {
          this.result[prop] = {};
        } else {
          Object.keys(cur)
            .forEach(p => this.recurse(cur[p], prop ? `${prop}.${p}` : p));
        }
        break;
      default: // It is not an object neither an array.
        this.result[prop] = cur;
    }
  }
}

/**
 * Single function utility class for unflattening a json object
 * 
 * @extends JsonOperator
 */
class JsonUnFlattener implements JsonOperator {
  /** 
   * @param {{}} jsonObject - The json object to be unflattened. 
   */
  apply(jsonObject: {}) {
    const result = {};
    Object.keys(jsonObject).forEach(p => {
      let cur = result;
      let prop = '';
      let last = 0;
      let idx;
      do {
        idx = p.indexOf('.', last);
        const temp = p.substring(last, idx !== -1 ? idx : undefined);
        cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp, 10)) ? [] : {}));
        prop = temp;
        last = idx + 1;
      } while (idx >= 0);
      cur[prop] = jsonObject[p];
    });
    return result[''];
  }
}