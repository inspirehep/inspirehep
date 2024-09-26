export interface FieldSplitResult {
  unsplitted: string;
  splits: Array<{
    path: Array<any>;
    value: string;
  }>;
}
