import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/map';
// TODO: only import forkJoin operator
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class SchemaRefResolverService {

  private baseApiUrl: string = 'http://localhost:5000/schemas/records';

  constructor(private http: Http) { }

  /**
   * This resolves top level $ref properties in schema by getting them via HTTP
   * and attaching to the schema
   */
  resolveRefs(schema: {}): Promise<{}> {
    const indexedProps = [];
    const innerSchemasObservables = Object.keys(schema)
      .filter(prop => schema[prop]['$ref'])
      .map((prop, index) => {
        indexedProps[index] = prop;
        return this.fetchInnerSchemaFromRef(schema[prop]['$ref'])
      });
    return Observable.forkJoin(innerSchemasObservables)
      .toPromise()
      .then((innnerSchemas: Array<{}>) => {
        innnerSchemas.forEach((innerSchema, index)=> {
          const prop = indexedProps[index];
          schema[prop] = innerSchema;
        });
        return schema;
      });
  }

  private fetchInnerSchemaFromRef(relativeRef: string): Observable<{}> {
    const schemaUrl = `${this.baseApiUrl}/${relativeRef}`;
    return this.http.get(schemaUrl)
      .map(res => res.json());
  }
}