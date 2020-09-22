import { Component, OnInit, Input } from '@angular/core';
import { JsonPatch } from '../../../shared/interfaces';

@Component({
  selector: 're-primitive-node',
  templateUrl: './primitive-node.component.html',
  styleUrls: ['./primitive-node.component.scss',
    '../node.component.scss']
})
export class PrimitiveNodeComponent implements OnInit {
  @Input() value: string | number | boolean;
  @Input() diff?: JsonPatch;
  @Input() depth: number;

  newValue: any;

  ngOnInit() {
    let value = this.value;
    if (this.diff) {
      if (this.diff.op === 'replace') {
        this.newValue = this.diff.value;
      }
    }
  }

}
