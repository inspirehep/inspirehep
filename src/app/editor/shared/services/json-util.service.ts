/*
 * This file is part of record-editor.
 * Copyright (C) 2016 CERN.
 *
 * record-editor is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * record-editor is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with record-editor; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.
 * In applying this license, CERN does not
 * waive the privileges and immunities granted to it by virtue of its status
 * as an Intergovernmental Organization or submit itself to any jurisdiction.
*/

import { Injectable } from '@angular/core';
import { ComponentTypeService } from './component-type.service'

/**
 * WARNING: this doesn't work when the root json object is an array!
 * TODO: make these custom rxjs operator
 */
@Injectable()
export class JsonUtilService {

  private componentTypeService: ComponentTypeService = new ComponentTypeService();

  /**
   * FIXME: shallow flattening!
   */
  flattenMARCSchema(schema: Object): Object {
    Object.keys(schema['properties'])
      .filter(field => this.componentTypeService.getComponentType(schema['properties'][field]) === 'table-list')
      .forEach(field => {
        let elementSchema = schema['properties'][field]['items'];
        Object.keys(elementSchema['properties'])
          .filter(elementProp => elementSchema['properties'][elementProp]['type'] === 'object')
          .forEach(objectElementProp => {
            Object.keys(elementSchema['properties'][objectElementProp]['properties'])
              .forEach(prop => {
                elementSchema['properties'][`${objectElementProp}.${prop}`] = elementSchema['properties'][objectElementProp]['properties'][prop];
              });
            delete elementSchema['properties'][objectElementProp];
          });
      });
    return schema;
  }
  
  /**
   * TODO: add example input and output to the function doc!
   * 
   * @param {Object} jsonObject - The marc json object to be flattened.
   */
  flattenMARCJson(jsonObject: Object, schema: Object): Object {
    return this.modifyMARCJson(jsonObject, schema['properties'], new JsonFlattener());
  }

  /**
   * TODO: add example input and output to the function doc!
   * 
   * @param {Object} jsonObject - The marc json object to be unflattened.
   */
  unflattenMARCJson(jsonObject: Object, schema: Object): Object {
    return this.modifyMARCJson(jsonObject, schema['properties'], new JsonUnFlattener());
  }

  /**
   * This skips top level properties (MARC fields) and array type properties of the top level properties (MARC subfields with array of objects as a property)
   * and apply the given operator to all the rest.
   * 
   * @param {Object} jsonObject - The marc json object to be flattened.
   * @param {Object} schema - The schema to be used to determine if a property of the jsonObject should be flattened, (schema.properties)
   * @param {JsonOperator} jsonOperator - The operator to be applied to given json object
   * 
   */
  private modifyMARCJson(jsonObject: Object, schema: Object, jsonOperator: JsonOperator): Object {
    const modifiedJson = {};
    // TODO: create multiple instances of JsonOperator inside forEach function if this operation should be parallel
    // FIXME: doesn't flatten table-list in complex-list
    Object.keys(jsonObject)
      .forEach(prop => {
        switch (this.componentTypeService.getComponentType(schema[prop])) {
          case 'table-list':
            modifiedJson[prop] = [];
            jsonObject[prop].forEach((element, i) => {
              modifiedJson[prop][i] = jsonOperator.apply(element, schema[prop]['items']);
            });
            break;
          case 'object':
            modifiedJson[prop] = jsonOperator.apply(jsonObject[prop], schema[prop]);
            break;
          default:
            modifiedJson[prop] = jsonObject[prop];
        }
      });
    return modifiedJson;
  }
}


/**
 * Single function utility interface
 */
interface JsonOperator {
  apply(jsonObject: Object, schema?: Object): Object;
}

/**
 * Single function utility class for flattening a json object
 * 
 * @extends JsonOperator
 */
class JsonFlattener implements JsonOperator {
  private result: Object;

  /**
   * Flattens only objects!
   * 
   * @param {Object} jsonObject - The json object to be flattened. 
   * @param {Object} schema - The json schema to be flattened.
   */
  apply(jsonObject: Object, schema: Object): Object {
    this.result = {};
    this.recurse(jsonObject, '', schema);
    return this.result;
  }

  private recurse(cur, prop, schema) {
    switch (schema['type']) {
      case 'object':
        const keys = Object.keys(cur);
        if (keys.length === 0) {
          this.result[prop] = {};
        } else {
          keys.forEach(p => this.recurse(cur[p], prop ? `${prop}.${p}` : p, schema['properties'][p]));
        }
        break;
      default:
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
   * @param {Object} jsonObject - The json object to be unflattened. 
   * @param {Object} schema - NOT USED!
   */
  apply(jsonObject: Object, schema: Object): Object {
    const json = {};
    Object.keys(jsonObject).forEach(p => {
      let cur = json;
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
    return { json: json[''] };
  }
}