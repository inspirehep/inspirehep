import { AUTHORS_PID_TYPE } from '../common/constants';

export enum WorkflowTypes {
  AUTHOR_CREATE = 'AUTHOR_CREATE',
  AUTHOR_UPDATE = 'AUTHOR_UPDATE',
}

export const WORKFLOW_TYPES = {
  [WorkflowTypes.AUTHOR_CREATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.AUTHOR_UPDATE]: AUTHORS_PID_TYPE,
};
