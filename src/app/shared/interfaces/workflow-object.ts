import { WorkflowValidationError } from './workflow-validation-error';

export interface WorkflowObject {
  _extra_data?: {
    validation_errors?: Array<WorkflowValidationError>
  };
}
