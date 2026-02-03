import { ValidationError } from './validation-error';
import { JsonPatch } from './json-patch';

export interface WorkflowObject<T = object> {
  id: number;
  validation_errors?: Array<ValidationError>;
  _extra_data?: {
    validation_errors?: Array<ValidationError>;
    callback_url?: string;
    conflicts?: Array<JsonPatch>;
    ticket_id?: string;
    ticket_url?: string;
  };
  merge_details?: {
    conflicts?: Array<JsonPatch>;
  };
  callback_url?: string;
  status?: string;
  metadata: {
    $schema: string;
    _collections: string[];
    acquisition_source: T;
    name: {
      value: string;
      preferred_name?: string;
    };
    status?: string;
  };
}
