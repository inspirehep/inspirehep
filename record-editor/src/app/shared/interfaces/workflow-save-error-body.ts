import { WorkflowObject } from './workflow-object';
import { DefaultApiErrorBody } from './default-api-error-body';

export interface WorkflowSaveErrorBody extends DefaultApiErrorBody {
  // TODO: use string when typescript is v2.4 or above
  error_code: 'VALIDATION_ERROR' | 'MALFORMED';
  workflow?: WorkflowObject;
}
