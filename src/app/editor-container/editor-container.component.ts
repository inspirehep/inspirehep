import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EditorComponent } from '../editor';

import { RecordService } from './record.service';

@Component({
  selector: 'app',
  directives: [EditorComponent],
  pipes: [],
  providers: [RecordService],
  styles: [],
  template: require('./editor-container.component.html')
})
export class EditorContainerComponent {
  private record: Object = {};
  private schema: Object = {};

  constructor(private router: Router, private recordService: RecordService) { }


  ngOnInit() {
    this.router.routerState.queryParams.subscribe(params => {
      let record;
      this.recordService.fetchRecord(params['url'])
        .flatMap(fetched => {
          record = fetched;
          return this.recordService.fetchMockSchema();
        }).subscribe(schema => {
          // TODO: Remove these delete, when record comes from DB not from Elasticsearch and schema is more consistent
          Object.keys(record).forEach((prop) => {
            if (schema[prop] == null) {
              delete record[prop];
              console.log('not in schema => ', prop);
            }
          });
          delete record['self']; // ingrone self

          this.record = record;
          this.schema = schema;
        }, error => console.error(error));
    });
  }
}