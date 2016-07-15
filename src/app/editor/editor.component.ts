import { Component, Input, ViewEncapsulation} from '@angular/core';

import { AbstractTrackerComponent } from './abstract-tracker';
import { ArrayInArrayFieldComponent } from './array-in-array-field';
import { ObjectArrayFieldComponent } from './object-array-field';
import { ObjectFieldComponent } from './object-field';
import { PrimitiveArrayFieldComponent } from './primitive-array-field';
import { PrimitiveFieldComponent } from './primitive-field';


import { MapToIterablePipe, UnderscoreToSpacePipe } from './shared/pipes';

import {
  JsonUtilService,
  RecordFixerService,
  RecordService,
} from './shared/services';

@Component({
  selector: 'editor',
  encapsulation: ViewEncapsulation.None,
  directives: [
    ArrayInArrayFieldComponent,
    PrimitiveArrayFieldComponent,
    PrimitiveFieldComponent,
    ObjectArrayFieldComponent,
    ObjectFieldComponent
  ],
  pipes: [MapToIterablePipe, UnderscoreToSpacePipe],
  providers: [
    JsonUtilService,
    RecordService,
    RecordFixerService,
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
    private recordFixerService: RecordFixerService) {
    super();

    // FIXME: find a better way to make editor wait until we got the schema
    let record;
    
    this.recordService.fetchRecord('literature', '1404685')
      .flatMap(json => {
        record = json;
        return this.recordService.fetchSchema(json['$schema']);
      }).subscribe(schema => {
        // TODO: Remove these delete, when record comes from DB not from Elasticsearch and schema is more consistent
        Object.keys(record).forEach((prop) => {
          if (record[prop].constructor.name === 'Array' && schema[prop] == null) {
            delete record[prop];
            delete schema[prop];
            console.log('not in schema => ', prop);
          }
        });
        delete record['self']; // ingrone this

        this.recordFixerService.fixRecord(record, schema);
        this.jsonDoc = this.jsonUtilService.flattenMARCJson(record);
        this.schema = schema;
      }, error => console.error(error));
  }

  onValueChange(event: any, key: string) {
    this.jsonDoc[key] = event;
  }

  getType(value: any): string {
    return this.jsonUtilService.getType(value);
  }

  ngOnInit() {
    setTimeout(() => console.log(this.jsonDoc), 8000);
  }
}