/*
 * This file is part of ng2-multi-record-editor.
 * Copyright (C) 2017 CERN.
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
import { fromJS, OrderedSet } from 'immutable';
import { JSONSchema } from 'ng2-json-editor';
import * as _ from 'lodash';

import { UserActions } from '../interfaces';

@Injectable()
export class SchemaKeysStoreService {

  public readonly separator = '.';
  public schemaKeyStoreMap: { [path: string]: OrderedSet<string> } = {};
  public schema: JSONSchema = {};

  constructor() { }

  public forPath(path: string): Array<string> {
    if (path === '') {
      return this.schemaKeyStoreMap[''].toArray();
    }
    return this.schemaKeyStoreMap[`${this.separator}${path}`] ?
      this.schemaKeyStoreMap[`${this.separator}${path}`].toArray() : [];
  }

  public buildSchemaKeyStore(schema: JSONSchema) {
    this.schema = schema;
    this.buildSchemaKeyStoreRecursively('', schema);
  }

  private buildSchemaKeyStoreRecursively(path: string, schema: JSONSchema) {

    if (schema.type === 'object') {
      let finalKeys = Object.keys(schema.properties);
      this.schemaKeyStoreMap[path] = fromJS(finalKeys).toOrderedSet();
      finalKeys
        .filter(key => this.isObjectOrArraySchema(schema.properties[key]))
        .forEach(key => {
          let newPath = `${path}${this.separator}${key}`;
          this.buildSchemaKeyStoreRecursively(newPath, schema.properties[key]);
        });
    }

    if (schema.type === 'array') {
      if (schema.items.type === 'object') {
        let finalKeys = Object.keys(schema.items.properties);
        this.schemaKeyStoreMap[path] = fromJS(finalKeys).toOrderedSet();
        finalKeys
          .filter(key => this.isObjectOrArraySchema(schema.items.properties[key]))
          .forEach(key => {
            let newPath = `${path}${this.separator}${key}`;
            this.buildSchemaKeyStoreRecursively(newPath, schema.items.properties[key]);
          });
      }
    }
  }

  private isObjectOrArraySchema(schema: JSONSchema): boolean {
    return schema.type === 'object' || schema.type === 'array';
  }

  public findSubSchema(path: string): object {
    let subSchema = this.schema;
    if (path === '') {
      return subSchema;
    }
    let splitPath = path.split(this.separator);
    for (let index in splitPath) {
      if (subSchema.type === 'object') {
        if (subSchema.properties[splitPath[index]]) {
          subSchema = subSchema.properties[splitPath[index]];
        } else {
          return null;
        }
      } else if (subSchema.type === 'array') {
        if (subSchema.items.properties[splitPath[index]]) {
          subSchema = subSchema.items.properties[splitPath[index]];
        } else {
          return null;
        }
      }
    }
    if (subSchema.type === 'array') {
      subSchema = subSchema.items;
    }
    if (subSchema.type !== 'object') {
      // if primitive key then wrap it
      return {
        type: 'object',
        alwaysShow: ['value'],
        properties: {
          value: subSchema
        }
      };
    }
    return subSchema;
  }

}

