import { List, Map } from 'immutable';

import { AUTHORS_PID_TYPE, LITERATURE_PID_TYPE } from '../common/constants';

export enum WorkflowTypes {
  AUTHOR_CREATE = 'AUTHOR_CREATE',
  AUTHOR_UPDATE = 'AUTHOR_UPDATE',
  HEP_CREATE = 'HEP_CREATE',
  HEP_UPDATE = 'HEP_UPDATE',
}

export enum WorkflowStatuses {
  APPROVAL = 'approval',
  APPROVAL_CORE_SELECTION = 'approval_core_selection',
  APPROVAL_FUZZY_MATCHING = 'approval_fuzzy_matching',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  ERROR = 'error',
  ERROR_MULTIPLE_EXACT_MATCHES = 'error_multiple_exact_matches',
  ERROR_VALIDATION = 'error_validation',
  PROCESSING = 'processing',
  RUNNING = 'running',
}

export const WORKFLOW_TYPES = {
  [WorkflowTypes.AUTHOR_CREATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.AUTHOR_UPDATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.HEP_CREATE]: LITERATURE_PID_TYPE,
};

export interface WorkflowStatus {
  key: string;
  doc_count: number;
}

export interface WorkflowType {
  key: string;
  doc_count: number;
}

export interface WorkflowCardProps {
  type: Map<string, any>;
  statuses: List<Map<string, any>>;
}
