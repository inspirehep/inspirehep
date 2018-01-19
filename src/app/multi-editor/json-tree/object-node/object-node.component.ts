import { Component, OnInit, Input } from '@angular/core';
import { JsonPatch } from '../../shared/interfaces';
import { AbstractParentNode } from '../abstract-parent-node';

@Component({
  selector: 're-object-node',
  templateUrl: './object-node.component.html',
  styleUrls: ['./object-node.component.scss',
    '../node.component.scss']
})
export class ObjectNodeComponent extends AbstractParentNode implements OnInit {
  @Input() value: object;
  @Input() diff?: JsonPatch[];
  @Input() depth: number;
  @Input() expanded: boolean;

  pushedKey = false;

  ngOnInit() {
    this.keys = Object.keys(this.value);
    if (this.diff) {
      this.diff.forEach(patch => {
        if (this.isAddPatchForLeaf(patch)) {
          this.value[patch.path[this.depth]] = patch.value;
          this.keys.push(patch.path[this.depth]);
          this.setAndExtendDiffProperty(patch.path[this.depth]);
          this.pushedKey = true;
        } else if (patch.path.length > this.depth) {
          this.setAndExtendDiffProperty(patch.path[this.depth]);
        } else if (patch.path.length <= this.depth) {
          this.shouldExpandKeys = true;
        }
        this.patchesMap.set(patch.path[this.depth], this.getPatchesForChild(patch.path[this.depth]));
      });
      if (this.shouldExpandKeys) {
        this.keys.forEach(key => {
          this.patchesMap.set(key, this.diff);
          this.setAndExtendDiffProperty(key);
        });
      }
      if (this.pushedKey) {
        this.keys.sort();
      }
      this.diffType = this.diff[0].op;
    }
  }

  setAndExtendDiffProperty(key: string) {
    this.diffKeys.set(key, true);
    this.expand(key);
  }
  trackByItem(index: number, item: object): object {
    return item;
  }
}
