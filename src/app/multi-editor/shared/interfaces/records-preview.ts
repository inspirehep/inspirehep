import { JsonPatch } from '../../../shared/interfaces';

export interface RecordsPreview {
    json_records: object[];
    json_patches: JsonPatch[];
    errors: string[];
    uuids: string[];
  }
