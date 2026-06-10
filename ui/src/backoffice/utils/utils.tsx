import React from 'react';
import { List, Map } from 'immutable';
import {
  WarningOutlined,
  CheckOutlined,
  HourglassOutlined,
  LoadingOutlined,
  FieldTimeOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Action, ActionCreator } from 'redux';

import moment from 'moment-timezone';

import storage from '../../common/storage';
import { BACKOFFICE_LOGIN, BACKOFFICE_LOGIN_API } from '../../common/routes';
import { searchQueryUpdate } from '../../actions/search';
import { WorkflowTypes } from '../constants';
import {
  BACKOFFICE_AUTHORS_SEARCH_NS,
  BACKOFFICE_LITERATURE_SEARCH_NS,
} from '../../search/constants';
import {
  WorkflowDecisions,
  HIDDEN_DECISION_ACTIONS,
  LOCAL_TIMEZONE,
} from '../../common/constants';

export const COLLECTIONS = [
  {
    key: 'new authors',
    value: WorkflowTypes.AUTHOR_CREATE,
  },
  {
    key: 'author updates',
    value: WorkflowTypes.AUTHOR_UPDATE,
  },
  {
    key: 'new arxiv harvests',
    value: WorkflowTypes.HEP_CREATE,
  },
  {
    key: 'new publisher harvests',
    value: WorkflowTypes.HEP_PUBLISHER_CREATE,
  },
  {
    key: 'publisher updates',
    value: WorkflowTypes.HEP_PUBLISHER_UPDATE,
  },
  {
    key: 'arxiv updates',
    value: WorkflowTypes.HEP_UPDATE,
  },
  {
    key: 'new literature submissions',
    value: WorkflowTypes.HEP_SUBMISSION,
  },
  { key: 'manual merge', value: WorkflowTypes.HEP_MANUAL_MERGE },
];

export const refreshToken = async () => {
  try {
    const res = await fetch(`${BACKOFFICE_LOGIN_API}refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: storage.getSync('backoffice.refreshToken'),
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await res.json();
    storage.set('backoffice.token', data.access);
    return data.access;
  } catch (error) {
    window.location.assign(BACKOFFICE_LOGIN);
  }

  return null;
};

export const resolveDecision = (decision: string | number) => {
  const decisions: {
    [key: string]: { bg: string; text: string; decision: string };
  } = {
    [WorkflowDecisions.ACCEPT]: {
      bg: 'bg-completed ml1',
      text: 'Accept',
      decision: 'accepted',
    },
    [WorkflowDecisions.ACCEPT_CURATE]: {
      bg: 'bg-halted ml1',
      text: 'Accept Curate',
      decision: 'accepted with curation',
    },
    [WorkflowDecisions.REJECT]: {
      bg: 'bg-error font-white',
      text: 'Reject',
      decision: 'rejected',
    },
    [WorkflowDecisions.HEP_ACCEPT]: {
      bg: 'bg-completed ml1',
      text: 'Accept',
      decision: 'accepted as Non-CORE',
    },
    [WorkflowDecisions.HEP_ACCEPT_CORE]: {
      bg: 'bg-completed ml1',
      text: 'Accept CORE',
      decision: 'accepted as CORE',
    },
    [WorkflowDecisions.HEP_REJECT]: {
      bg: 'bg-error font-white',
      text: 'Reject',
      decision: 'rejected',
    },
    [WorkflowDecisions.CORE_SELECTION_ACCEPT]: {
      bg: 'bg-completed ml1',
      text: 'Accept',
      decision: 'accepted as Non-CORE',
    },
    [WorkflowDecisions.CORE_SELECTION_ACCEPT_CORE]: {
      bg: 'bg-completed ml1',
      text: 'Accept CORE',
      decision: 'accepted as CORE',
    },
    [WorkflowDecisions.AUTO_ACCEPT_CORE]: {
      bg: 'bg-completed ml1',
      text: 'Auto Accept CORE',
      decision: 'accepted as CORE',
    },
    [WorkflowDecisions.AUTO_REJECT]: {
      bg: 'bg-error font-white',
      text: 'Auto Reject',
      decision: 'auto rejected',
    },
    [WorkflowDecisions.DISCARD]: {
      bg: 'bg-error font-white',
      text: 'Discard',
      decision: 'discarded',
    },
    [WorkflowDecisions.WITHDRAWN]: {
      bg: 'bg-error font-white',
      text: 'Withdrawn',
      decision: 'withdrawn',
    },
    [WorkflowDecisions.MANUAL_MERGE_APPROVE]: {
      bg: 'bg-completed ml1',
      text: 'Merge Approved',
      decision: 'merge approved',
    },
  };
  return decisions[decision] || null;
};

export const filterDecisions = (decisions?: List<Map<string, any>>) =>
  decisions?.filter(
    (decision: Map<string, any>) =>
      !HIDDEN_DECISION_ACTIONS.has(decision.get('action'))
  ) ?? null;

export const resolveAutomaticDecision = (decision: string | number) => {
  const decisions: {
    [key: string]: { class: string; text: string };
  } = {
    CORE: { class: 'text-core', text: 'CORE' },
    'Non-CORE': {
      class: 'text-non-core',
      text: 'Non-CORE',
    },
    Rejected: {
      class: 'text-rejected',
      text: 'Rejected',
    },
  };
  return decisions[decision] || null;
};

export const handleSearch = (
  dispatch: ActionCreator<Action>,
  searchValue: string,
  namespace:
    | typeof BACKOFFICE_AUTHORS_SEARCH_NS
    | typeof BACKOFFICE_LITERATURE_SEARCH_NS
) => {
  if (!searchValue) {
    dispatch(searchQueryUpdate(namespace, {}));
  } else {
    const query = {
      q: searchValue,
    };
    dispatch(searchQueryUpdate(namespace, query));
  }
};

export const hasPublicationInfo = (
  publicationInfo?: List<Map<string, any>> | null
) => {
  const firstPub: Map<string, any> | undefined = List.isList(publicationInfo)
    ? (publicationInfo as List<Map<string, any>>).first()
    : undefined;
  return Boolean(
    !!firstPub &&
      (firstPub.get('journal_title') || firstPub.get('pubinfo_freetext'))
  );
};

export const isFullCoverageWorkflow = (
  workflowType?: string | null,
  journalCoverage?: string | null
) => workflowType === WorkflowTypes.HEP_CREATE && journalCoverage === 'full';

export const isLiteratureUpdateWorkflow = (workflowType?: string | null) =>
  workflowType === WorkflowTypes.HEP_UPDATE ||
  workflowType === WorkflowTypes.HEP_PUBLISHER_UPDATE;

export const getWorkflowStatusInfo = (status: string) => {
  const statuses: {
    [key: string]: { icon: JSX.Element; text: string; description: string };
  } = {
    completed: {
      icon: <CheckOutlined className="mr2" />,
      text: 'Completed',
      description: 'This workflow has been completed.',
    },
    approval: {
      icon: <HourglassOutlined className="mr2" />,
      text: 'Waiting for approval',
      description: 'This workflow has been halted until decision is made.',
    },
    approval_core_selection: {
      icon: <HourglassOutlined className="mr2" />,
      text: 'Waiting for CORE selection approval',
      description: 'This workflow is waiting for CORE selection approval.',
    },
    approval_fuzzy_matching: {
      icon: <HourglassOutlined className="mr2" />,
      text: 'Waiting for matching approval',
      description: 'This workflow is currently matching.',
    },
    approval_merge: {
      icon: <HourglassOutlined className="mr2" />,
      text: 'Waiting for merge approval',
      description: 'This workflow is currently waiting for merging.',
    },
    running: {
      icon: <LoadingOutlined className="mr2" />,
      text: 'Running',
      description:
        'This workflow is currently running. Please wait for it to complete.',
    },
    processing: {
      icon: <FieldTimeOutlined className="mr2" />,
      text: 'Processing',
      description: 'This workflow is currently processing.',
    },
    blocked: {
      icon: <StopOutlined className="mr2" />,
      text: 'Blocked',
      description: 'This workflow is currently blocked.',
    },
    error: {
      icon: <WarningOutlined className="mr2" />,
      text: 'Error',
      description:
        'This record is in error state. View record details for more information.',
    },
    error_multiple_exact_matches: {
      icon: <WarningOutlined className="mr2" />,
      text: 'Multiple exact matches',
      description:
        'This record has multiple exact matches. View record details for more information.',
    },
    error_validation: {
      icon: <WarningOutlined className="mr2" />,
      text: 'Validation Error',
      description:
        'This record has validation errors. View record details for more information.',
    },
    missing_subject_fields: {
      icon: <HourglassOutlined className="mr2" />,
      text: 'Missing subject fields',
      description:
        'This record is missing subject fields. Add subject fields or reject it.',
    },
  };

  return statuses[status] || null;
};

export const filterByProperty = (
  data: Map<string, any>,
  dataField: string,
  property: string,
  value: any,
  include: boolean = true
) => {
  return data
    ?.get(dataField)
    ?.filter((item: Map<string, any>) =>
      include ? item.get(property) === value : item.get(property) !== value
    );
};

export const formatDateTime = (
  rawDateTime: string | undefined
): { date: string; time: string } | undefined => {
  if (!rawDateTime) {
    return undefined;
  }
  const momentToLocalTimezone = moment.utc(rawDateTime).tz(LOCAL_TIMEZONE);
  if (!momentToLocalTimezone.isValid()) return undefined;
  return {
    date: momentToLocalTimezone.format('YYYY-MM-DD'),
    time: momentToLocalTimezone.format('hh:mm A'),
  };
};

export const getDag = (workflow_type: string): string | undefined => {
  switch (workflow_type) {
    case WorkflowTypes.AUTHOR_CREATE:
      return 'author_create_initialization_dag';
    case WorkflowTypes.AUTHOR_UPDATE:
      return 'author_update_dag';
    case WorkflowTypes.HEP_CREATE:
      return 'hep_create_dag';
    case WorkflowTypes.HEP_PUBLISHER_CREATE:
      return 'hep_create_dag';
    case WorkflowTypes.HEP_PUBLISHER_UPDATE:
      return 'hep_create_dag';
    case WorkflowTypes.HEP_SUBMISSION:
      return 'hep_create_dag';
    case WorkflowTypes.HEP_UPDATE:
      return 'hep_create_dag';
    case WorkflowTypes.HEP_MANUAL_MERGE:
      return 'hep_manual_merge_dag';
    default:
      return undefined;
  }
};

export const createPdfLinksFromArxivEprints = (
  eprints: List<Map<string, any>>
): List<Map<string, any>> =>
  eprints.map((eprint) =>
    Map({ value: `//arxiv.org/pdf/${eprint.get('value')}` })
  );
