import { AUTHORS_PID_TYPE, LITERATURE_PID_TYPE } from '../common/constants';

export enum WorkflowTypes {
  AUTHOR_CREATE = 'AUTHOR_CREATE',
  AUTHOR_UPDATE = 'AUTHOR_UPDATE',
  HEP_CREATE = 'HEP_CREATE',
  HEP_PUBLISHER_CREATE = 'HEP_PUBLISHER_CREATE',
  HEP_PUBLISHER_UPDATE = 'HEP_PUBLISHER_UPDATE',
  HEP_SUBMISSION = 'HEP_SUBMISSION',
  HEP_UPDATE = 'HEP_UPDATE',
  HEP_MANUAL_MERGE = 'HEP_MANUAL_MERGE',
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
  UPDATE = 'update',
}

export enum WorkflowStatusGroups {
  NEEDS_REVIEW = 'needs_review',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  FAILED = 'failed',
  IN_PROGRESS = 'in_progress',
}

export const WORKFLOW_TYPES = {
  [WorkflowTypes.AUTHOR_CREATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.AUTHOR_UPDATE]: AUTHORS_PID_TYPE,
  [WorkflowTypes.HEP_CREATE]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_PUBLISHER_CREATE]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_PUBLISHER_UPDATE]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_SUBMISSION]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_UPDATE]: LITERATURE_PID_TYPE,
  [WorkflowTypes.HEP_MANUAL_MERGE]: LITERATURE_PID_TYPE,
};

export const WORKFLOW_TYPE_ORDER = [
  WorkflowTypes.AUTHOR_CREATE,
  WorkflowTypes.AUTHOR_UPDATE,
  WorkflowTypes.HEP_CREATE,
  WorkflowTypes.HEP_UPDATE,
  WorkflowTypes.HEP_PUBLISHER_CREATE,
  WorkflowTypes.HEP_PUBLISHER_UPDATE,
  WorkflowTypes.HEP_SUBMISSION,
  WorkflowTypes.HEP_MANUAL_MERGE,
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

export const WORKFLOW_STATUS_TO_STATUS_GROUP: Record<
  WorkflowStatuses,
  WorkflowStatusGroups
> = {
  [WorkflowStatuses.APPROVAL]: WorkflowStatusGroups.NEEDS_REVIEW,
  [WorkflowStatuses.APPROVAL_CORE_SELECTION]: WorkflowStatusGroups.NEEDS_REVIEW,
  [WorkflowStatuses.APPROVAL_FUZZY_MATCHING]: WorkflowStatusGroups.NEEDS_REVIEW,
  [WorkflowStatuses.APPROVAL_MERGE]: WorkflowStatusGroups.NEEDS_REVIEW,
  [WorkflowStatuses.BLOCKED]: WorkflowStatusGroups.BLOCKED,
  [WorkflowStatuses.COMPLETED]: WorkflowStatusGroups.COMPLETED,
  [WorkflowStatuses.ERROR]: WorkflowStatusGroups.FAILED,
  [WorkflowStatuses.ERROR_MULTIPLE_EXACT_MATCHES]: WorkflowStatusGroups.FAILED,
  [WorkflowStatuses.ERROR_VALIDATION]: WorkflowStatusGroups.FAILED,
  [WorkflowStatuses.MISSING_SUBJECT_FIELDS]: WorkflowStatusGroups.NEEDS_REVIEW,
  [WorkflowStatuses.PROCESSING]: WorkflowStatusGroups.IN_PROGRESS,
  [WorkflowStatuses.RUNNING]: WorkflowStatusGroups.IN_PROGRESS,
};

export const STATUS_GROUPS_CONFIG: Record<
  WorkflowStatusGroups,
  { label: string; isCollapsable: boolean }
> = {
  [WorkflowStatusGroups.NEEDS_REVIEW]: {
    label: 'Needs review',
    isCollapsable: true,
  },
  [WorkflowStatusGroups.FAILED]: { label: 'Failed', isCollapsable: true },
  [WorkflowStatusGroups.IN_PROGRESS]: {
    label: 'In progress',
    isCollapsable: true,
  },
  [WorkflowStatusGroups.BLOCKED]: { label: 'Blocked', isCollapsable: false },
  [WorkflowStatusGroups.COMPLETED]: {
    label: 'Completed',
    isCollapsable: false,
  },
};

export const statusesWithUpdatableSubjects = [
  WorkflowStatuses.APPROVAL,
  WorkflowStatuses.APPROVAL_CORE_SELECTION,
  WorkflowStatuses.APPROVAL_MERGE,
  WorkflowStatuses.MISSING_SUBJECT_FIELDS,
];

export interface WorkflowStatus {
  key: string;
  doc_count: number;
}

export interface WorkflowType {
  key: string;
  doc_count: number;
}

export enum CollapseState {
  ALL_COLLAPSED = 'allCollapsed',
  ALL_EXPANDED = 'allExpanded',
  MIXED = 'mixed',
}

export interface Subject {
  term: string;
  source: string;
}
