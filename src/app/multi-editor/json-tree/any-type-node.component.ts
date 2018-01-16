import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { JsonPatch } from '../shared/interfaces';

@Component({
  selector: 're-any-type-node',
  templateUrl: './any-type-node.component.html',
  styleUrls: ['./any-type-node.component.scss']
})
export class AnyTypeNodeComponent implements OnInit {
  @Input() value: any;
  @Input() diff: JsonPatch[];
  @Input() depth: number;
  @Input() expanded: boolean;
  valueType: string;

  ngOnInit() {
    if (Array.isArray(this.value)) {
      this.valueType = 'array';
    } else if (typeof this.value === 'object') {
      this.valueType = 'object';
    } else {
      this.valueType = 'primitive';
    }
  }

  get firstDiff(): JsonPatch | null {
    if (this.diff) {
      return this.diff[0];
    } else {
      return null;
    }
  }
}
