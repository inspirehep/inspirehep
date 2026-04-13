import { List, Map } from 'immutable';

import { AUTHORS_PID_TYPE, LITERATURE_PID_TYPE } from '../common/constants';

export enum WorkflowTypes {
  AUTHOR_CREATE = 'AUTHOR_CREATE',
  AUTHOR_UPDATE = 'AUTHOR_UPDATE',
  HEP_CREATE = 'HEP_CREATE',
  HEP_PUBLISHER_CREATE = 'HEP_PUBLISHER_CREATE',
  HEP_PUBLISHER_UPDATE = 'HEP_PUBLISHER_UPDATE',
  HEP_SUBMISSION = 'HEP_SUBMISSION',
  HEP_UPDATE = 'HEP_UPDATE',
}

export enum WorkflowStatuses {
  APPROVAL = 'approval',
  APPROVAL_CORE_SELECTION = 'approval_core_selection',
  APPROVAL_FUZZY_MATCHING = 'approval_fuzzy_matching',
  APPROVAL_MERGE = 'approval_merge',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  ERROR = 'error',
  ERROR_MULTIPLE_EXACT_MATCHES = 'error_multiple_exact_matches',
  ERROR_VALIDATION = 'error_validation',
  MISSING_SUBJECT_FIELDS = 'missing_subject_fields',
  PROCESSING = 'processing',
  RUNNING = 'running',
}

export enum WorkflowActions {
  RESOLVE = 'resolve',
  RESTART = 'restart',
  RESTART_CURRENT = 'restart_current',
}

export const WORKFLOW_TYPES = {
  [WorkflowTypes.AUTHOR_CREATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.AUTHOR_UPDATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.HEP_CREATE]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_PUBLISHER_CREATE]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_PUBLISHER_UPDATE]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_SUBMISSION]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_UPDATE]: LITERATURE_PID_TYPE,
};

export const WORKFLOW_TYPE_ORDER = [
  WorkflowTypes.AUTHOR_CREATE,
  WorkflowTypes.AUTHOR_UPDATE,
  WorkflowTypes.HEP_CREATE,
  WorkflowTypes.HEP_UPDATE,
  WorkflowTypes.HEP_PUBLISHER_CREATE,
  WorkflowTypes.HEP_PUBLISHER_UPDATE,
  WorkflowTypes.HEP_SUBMISSION,
];

export const WORKFLOW_STATUS_ORDER = [
  WorkflowStatuses.APPROVAL,
  WorkflowStatuses.APPROVAL_CORE_SELECTION,
  WorkflowStatuses.APPROVAL_FUZZY_MATCHING,
  WorkflowStatuses.APPROVAL_MERGE,
  WorkflowStatuses.BLOCKED,
  WorkflowStatuses.COMPLETED,
  WorkflowStatuses.ERROR,
  WorkflowStatuses.ERROR_MULTIPLE_EXACT_MATCHES,
  WorkflowStatuses.ERROR_VALIDATION,
  WorkflowStatuses.MISSING_SUBJECT_FIELDS,
  WorkflowStatuses.PROCESSING,
  WorkflowStatuses.RUNNING,
];

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
