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

import { EmptyValueService } from './empty-value.service';
import { ComponentTypeService } from './component-type.service';

@Injectable()
export class RecordFixerService {

  private emptyValueService: EmptyValueService = new EmptyValueService();
  private componentTypeService: ComponentTypeService = new ComponentTypeService();

  // TODO: return fixed record!
  fixRecord(record: Object, schema: Object) {
    Object.keys(record).forEach(field => {
      if (!schema[field]) {
        this.deleteField(record, field);
      } else {
        this.fix(field, record, schema[field])
      }
    });

    this.insertEmptyIntoAlwaysShowFields(record, schema);
  }


  private insertEmptyIntoAlwaysShowFields(record: Object, schema: Object) {
    let paths = new AlwaysShowPathFinder().getPaths(schema);
    paths.forEach(path => {
      /**
       * HACK:
       * the function expects schema to be in json-schema format
       * on the otherhand fetching service returns directly inside of `properties` from the schema
       * that's why here `properties` is need.
       * 
       * Other wise we would have loop over Object.keys(schema) then call the function for each of them.
       */
      let rootSchema = { 'properties': schema };
      this.insertEmptyIntoPath(path, record, rootSchema);
    });
  }

  /*
   * Inserts empty value into a highest level missing property going through the given path.
   * 
   * It goes into path step by step until it finds a property that isn't present
   * then inserts the empty record and stops.
   * 
   * @param {Array<string>} path - array of path elements
   * @param {any} value - value which the missing property will be inserted
   * @param {Object} schema - jsonschema of value
   */
  private insertEmptyIntoPath(path: Array<string>, value: any, schema: Object) {
    let subSchema = schema;
    for (let i = 0; i < path.length; i++) {
      subSchema = (subSchema['properties'] || subSchema['items']['properties'])[path[i]];
      if (!value[path[i]]) {
        value[path[i]] = this.emptyValueService.generateEmptyValue(subSchema);
        break;
      }

      if (subSchema['type'] === 'array') {
        for (let element of value[path[i]]) {
          if (path.length > 1) {
            this.insertEmptyIntoPath(path.slice(i + 1), element, subSchema['items']);
          }
        }
      }

      value = value[path[i]];
    }
  }

  /**
   * NOTE: the reason that parent and key are passed instead of the direct value
   * is to be able do some operations that needs the parent such as `delete`.
   */
  private fix(key: string | number, parent: Object | Array<any>, schema: Object) {
    if (schema['x_editor_hidden']) {
      delete parent[key];
      return;
    }
    let value = parent[key];

    if (this.componentTypeService.getComponentType(schema) === 'table-list') {
      this.fixTableList(value, schema);
    }

    // Recursive calls
    if (schema['type'] === 'object') {
      // Looping over record to filter out fields that are not in schema.
      Object.keys(value).forEach(prop => {
        if (!schema['properties'][prop]) {
          this.deleteField(value, prop);
        } else {
          this.fix(prop, value, schema['properties'][prop]);
        }
      });
    } else if (schema['type'] === 'array') {
      value.forEach((element, index) => {
        this.fix(index, value, schema['items']);
      });
    }
  }



  /**
   * Fixes the UI appearance of array fields that will be rendered as a table.
   *  1. Find all subfields that are present in any item.
   *  2. Insert empty values if an item doesn't have these subfields
   * 
   * Goal is to force all elements to have same subfields so that
   * table looks ok.
   */
  private fixTableList(array: Array<Object>, schema: Object) {
    let presentKeys = {};

    // 1. Step
    array.forEach(element => {
      Object.keys(element)
        .filter(key => schema['items']['properties'][key]) // Don't include  if not part of schema, will be deleted anyway.
        .forEach(key => {
          presentKeys[key] = true;
        });
    });

    // 2. Step
    Object.keys(presentKeys).forEach(key => {
      let emptyElement = this.emptyValueService.generateEmptyValue(schema['items']['properties'][key]);
      array.filter(element => !element[key])
        .forEach(element => {
          element[key] = emptyElement;
        });
    });
  }

  /**
   * Deletes given field from the given object.
   * Used for deleting fields that aren't on the schema.
   * 
   * TODO: replace this with only `delete` when logging is not necessary!
   */
  private deleteField(object: Object, field: string) {
    delete object[field];
    console.log(`REMOVED: ${field} not in schema`);
  }
}

class AlwaysShowPathFinder {

  private paths: Array<Array<string>> = [];


  getPaths(schema: Object): Array<Array<string>> {
    // Loop because fetchSchema returns inside of `properties` directly.
    Object.keys(schema).forEach(prop => {
      this.find([prop], schema[prop]);
    })
    return this.paths;
  }

  find(path: Array<string>, schema: Object) {
    if (schema['x_editor_always_show']) {
      this.paths.push(path);
      return;
    }

    let innerSchema = schema['type'] === 'array' ?
      schema['items']['properties'] : schema['properties'];

    if (innerSchema) {
      Object.keys(innerSchema).forEach(prop => {
        let newPath = path.concat([prop]); // copy! TODO: is it necessary?
        this.find(newPath, innerSchema[prop]);
      });
    }
  }
}