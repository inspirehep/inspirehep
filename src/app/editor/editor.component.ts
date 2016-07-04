import { Component, Input, ViewEncapsulation} from '@angular/core';

import { MapToIterablePipe } from './map-to-iterable.pipe';
import { UnderscoreToSpacePipe } from './underscore-to-space.pipe';

import { ArrayFieldComponent } from './array-field';
import { AbstractTrackerComponent } from './abstract-tracker';

import { RecordService } from './record.service';
import { JsonUtilService } from './json-util.service';
import { SchemaRefResolverService } from './schema-ref-resolver.service';

@Component({
  selector: 'editor',
  providers: [RecordService, JsonUtilService, SchemaRefResolverService],
  directives: [ArrayFieldComponent],
  pipes: [MapToIterablePipe, UnderscoreToSpacePipe],
  styles: [
    require('./editor.component.scss')
  ],
  template: require('./editor.component.html'),
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent extends AbstractTrackerComponent {
  // TODO: remove dummy
  jsonDoc: any = {};
  schema: any = {};

  constructor(private recordService: RecordService, private jsonUtilService: JsonUtilService, private schemaRefResolverService: SchemaRefResolverService) {
    super();
    // FIXME: find a better way to make editor wait until we got the schema
    let record;
    
    // FIXME: do not combine Promise and Observable
    this.recordService.fetchRecord('literature', '1404685')
      .flatMap(json => {
        record = this.jsonUtilService.flattenMARCJson(json);
        return this.recordService.fetchSchema(json['$schema']);
      }).toPromise().then(schema => {
        // TODO: Remove this, when record comes from DB not from Elasticsearch and schema is more consistent
        Object.keys(record).forEach((prop) => {
          if (record[prop].constructor.name === 'Array' && schema[prop] == null) {
            delete record[prop];
            console.log(prop);
          }
        });
        // TODO: Remove this when the schema comes already resolved! (WARNING: a lot of http requests!)
        return this.schemaRefResolverService.resolveRefs(schema);
      }).then(resolvedSchema =>{
        this.schema = resolvedSchema;
        this.jsonDoc = record;
      });
  }

  ngOnInit() {
    // setTimeout(() => console.log(this.jsonDoc), 5000);
  }
}