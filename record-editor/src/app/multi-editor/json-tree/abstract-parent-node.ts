import { JsonPatch } from '../../shared/interfaces';

export abstract class AbstractParentNode {
  diff?: JsonPatch[];
  depth: number;
  keys: string[] = [];
  diffType: string;
  isExpandedMap = new Map<string, boolean>();
  diffKeys = new Map<string, boolean>();
  patchesMap = new Map<string, JsonPatch[]>();
  readonly levelOffsetInPixels = 10;
  shouldExpandKeys = false;

  expand(key: string) {
    this.isExpandedMap.set(key, true);
  }

  getPropertyStyle(key: string): string {
    if (this.diffType === 'add' && this.diffKeys.has(key)) {
      return 'add';
    } else if (this.diffType === 'replace' && this.diffKeys.has(key)) {
      return 'replace';
    } else if (this.diffType === 'remove' && this.diffKeys.has(key)) {
      return 'remove';
    } else {
      return null;
    }
  }

  getPatchesForChild(key: string): JsonPatch[] {
    if (this.diff.length === 1) {
      return this.diff;
    } else {
      return this.diff.filter(item => item.path[this.depth] === key);
    }
  }

  isAddPatchForLeaf(patch: JsonPatch): boolean {
    return patch.path.length === this.depth + 1 && patch.op === 'add';
  }
}
