import { ValidationError } from './validation-error';
import { JsonPatch } from './json-patch';

export interface WorkflowObject<T = object> {
  id: number;
  _extra_data?: {
    validation_errors?: Array<ValidationError>;
    callback_url?: string;
    conflicts?: Array<JsonPatch>;
    ticket_id?: string;
    ticket_url?: string;
  };
  metadata: {
    $schema: string;
    _collections: ['Authors'];
    acquisition_source: T;
    name: {
      value: string;
      preferred_name?: string;
    };
    status?: string;
  };
}
