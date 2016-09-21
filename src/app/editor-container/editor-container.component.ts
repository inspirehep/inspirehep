import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { EditorComponent } from 'ng2-json-editor/ng2-json-editor';

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
          this.record = record;
          this.schema = schema;
        }, error => console.error(error));
    });
  }
}
