import { Component, Input, ViewEncapsulation} from '@angular/core';

import { ObjectArrayFieldComponent } from './object-array-field';
import { ArrayInArrayFieldComponent } from './array-in-array-field';
import { StringArrayFieldComponent } from './string-array-field';
import { AbstractTrackerComponent } from './abstract-tracker';
import { ObjectFieldComponent } from './object-field';

import { MapToIterablePipe, UnderscoreToSpacePipe } from './shared/pipes';

import {
  JsonUtilService,
  RecordFixerService,
  RecordService,
  SchemaRefResolverService,
 } from './shared/services';

@Component({
  selector: 'editor',
  encapsulation: ViewEncapsulation.None,
  directives: [
    ObjectArrayFieldComponent,
    ArrayInArrayFieldComponent,
    StringArrayFieldComponent,
    ObjectFieldComponent
  ],
  pipes: [MapToIterablePipe, UnderscoreToSpacePipe],
  providers: [
    RecordFixerService,
    JsonUtilService,
    RecordService,
    SchemaRefResolverService
  ],
  styles: [
    require('./editor.component.scss')
  ],
  template: require('./editor.component.html'),
})
export class EditorComponent extends AbstractTrackerComponent {
  // TODO: remove dummy
  jsonDoc: any = {};
  schema: any = {};

  constructor(private recordService: RecordService, 
    private jsonUtilService: JsonUtilService, 
    private schemaRefResolverService: SchemaRefResolverService,
    private recordFixerService: RecordFixerService) {
    super();
    // FIXME: find a better way to make editor wait until we got the schema
    let record;
    
    // FIXME: do not combine Promise and Observable
    this.recordService.fetchRecord('literature', '1404685')
      .flatMap(json => {
        record = json;
        return this.recordService.fetchSchema(json['$schema']);
      }).toPromise().then(schema => {
        // TODO: Remove this, when record comes from DB not from Elasticsearch and schema is more consistent
        Object.keys(record).forEach((prop) => {
          if (record[prop].constructor.name === 'Array' && schema[prop] == null) {
            delete record[prop];
            console.log('not in schema => ', prop);
          } else if (record[prop].constructor.name === 'Object' && schema[prop].properties == null) {
            delete record[prop];
            console.log('no .properties => ', prop);
          }
        });
        // TODO: Remove this when the schema comes already resolved! (WARNING: a lot of http requests!)
        return this.schemaRefResolverService.resolveRefs(schema);
      }).then(resolvedSchema =>{
        this.schema = resolvedSchema;
        this.recordFixerService.fixRecord(record, resolvedSchema);
        this.jsonDoc = this.jsonUtilService.flattenMARCJson(record);
      });
  }

  getType(value: any): string {
    return this.jsonUtilService.getType(value);
  }

  ngOnInit() {
    setTimeout(() => console.log(this.jsonDoc), 8000);
  }
}