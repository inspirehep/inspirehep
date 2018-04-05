import { Component, OnInit, Input } from '@angular/core';
import { JsonPatch } from '../../../shared/interfaces';
import { AbstractParentNode } from '../abstract-parent-node';

@Component({
  selector: 're-array-node',
  templateUrl: './array-node.component.html',
  styleUrls: ['./array-node.component.scss',
    '../node.component.scss']
})
export class ArrayNodeComponent extends AbstractParentNode implements OnInit {
  @Input() value: any[];
  @Input() diff?: JsonPatch[];
  @Input() depth: number;
  @Input() expanded: boolean;

  ngOnInit() {
    if (this.diff) {
      this.diff.forEach(patch => {
        if (this.isAddPatchForLeaf(patch)) {
          this.value.push(patch.value);
          this.diffKeys.set(patch.path[this.depth], true);
        } else if (patch.path.length <= this.depth) {
          this.shouldExpandKeys = true;
        } else if (patch.path.length > this.depth) {
          this.diffKeys.set(patch.path[this.depth], true);
        }
        this.patchesMap.set(patch.path[this.depth], this.getPatchesForChild(patch.path[this.depth]));
      });
      this.diffType = this.diff[0].op;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
