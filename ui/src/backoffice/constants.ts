import { AUTHORS_PID_TYPE, LITERATURE_PID_TYPE } from '../common/constants';

export enum WorkflowTypes {
  AUTHOR_CREATE = 'AUTHOR_CREATE',
  AUTHOR_UPDATE = 'AUTHOR_UPDATE',
  HEP_CREATE = 'HEP_CREATE',
}

export const WORKFLOW_TYPES = {
  [WorkflowTypes.AUTHOR_CREATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.AUTHOR_UPDATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.HEP_CREATE]: LITERATURE_PID_TYPE,
};
