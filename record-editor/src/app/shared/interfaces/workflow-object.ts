import { ValidationError } from './validation-error';
import { JsonPatch } from './json-patch';

export interface WorkflowObject {
  id: number;
  _extra_data?: {
    validation_errors?: Array<ValidationError>;
    callback_url?: string;
    conflicts?: Array<JsonPatch>;
  };
  metadata: object;
}
