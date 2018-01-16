export interface JsonPatch {
    op: string;
    path: string[];
    value?: any;
  }
