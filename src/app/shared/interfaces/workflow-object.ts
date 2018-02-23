import { WorkflowValidationError } from './workflow-validation-error';

export interface WorkflowObject {
  id: number;
  _extra_data?: {
    validation_errors?: Array<WorkflowValidationError>,
    callback_url?: string
  };
  metadata: object;
}
