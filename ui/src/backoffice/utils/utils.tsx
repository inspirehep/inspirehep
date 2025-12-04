import React from 'react';
import {
  WarningOutlined,
  CheckOutlined,
  HourglassOutlined,
  LoadingOutlined,
  FieldTimeOutlined,
  StopOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { Action, ActionCreator } from 'redux';

import storage from '../../common/storage';
import { BACKOFFICE_LOGIN, BACKOFFICE_LOGIN_API } from '../../common/routes';
import { searchQueryUpdate } from '../../actions/search';
import { WorkflowStatuses, WorkflowTypes } from '../constants';
import {
  BACKOFFICE_AUTHORS_SEARCH_NS,
  BACKOFFICE_LITERATURE_SEARCH_NS,
} from '../../search/constants';

export const COLLECTIONS = [
  {
    key: 'all collections',
    value: undefined,
  },
  {
    key: 'new authors',
    value: WorkflowTypes.AUTHOR_CREATE,
  },
  {
    key: 'author updates',
    value: WorkflowTypes.AUTHOR_UPDATE,
  },
  {
    key: 'new literature submissions',
    value: WorkflowTypes.HEP_CREATE,
  },
];

export const getIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case WorkflowStatuses.APPROVAL:
      return <HourglassOutlined className="mr2" />;
    case WorkflowStatuses.ERROR:
      return <WarningOutlined className="mr2" />;
    case WorkflowStatuses.COMPLETED:
      return <CheckOutlined className="mr2" />;
    case WorkflowStatuses.RUNNING:
      return <LoadingOutlined className="mr2" />;
    case WorkflowStatuses.PROCESSING:
      return <FieldTimeOutlined className="mr2" />;
    case WorkflowStatuses.BLOCKED:
      return <StopOutlined className="mr2" />;
    case WorkflowStatuses.APPROVAL_FUZZY_MATCHING:
      return <HourglassOutlined className="mr2" />;
    case WorkflowStatuses.ERROR_MULTIPLE_EXACT_MATCHES:
      return <WarningOutlined className="mr2" />;
    case WorkflowStatuses.ERROR_VALIDATION:
      return <WarningOutlined className="mr2" />;
    case WorkflowStatuses.APPROVAL_CORE_SELECTION:
      return <HourglassOutlined className="mr2" />;
    default:
      return null;
  }
};

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
    accept: { bg: 'bg-completed ml1', text: 'Accept', decision: 'accepted' },
    accept_curate: {
      bg: 'bg-halted ml1',
      text: 'Accept Curate',
      decision: 'accepted with curation',
    },
    reject: { bg: 'bg-error font-white', text: 'Reject', decision: 'rejected' },
  };
  return decisions[decision] || null;
};

export const resolveAutomaticDecision = (decision: string | number) => {
  const decisions: {
    [key: string]: { class: string; text: string };
  } = {
    CORE: { class: 'text-core', text: 'CORE' },
    'Non-CORE': {
      class: 'text-non-core',
      text: 'Non-CORE',
    },
    rejected: {
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
      icon: <StopOutlined className="mr2" />,
      text: 'Waiting for CORE selection approval',
      description: 'This workflow is waiting for CORE selection approval.',
    },
    approval_fuzzy_matching: {
      icon: <ControlOutlined className="mr2" />,
      text: 'Waiting for matching approval',
      description: 'This workflow is currently matching.',
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
  rawDateTime: string
): { date: string; time: string } | undefined => {
  try {
    const isoString = new Date(rawDateTime).toISOString();
    const [datePart, timePart] = isoString.split('T');
    const formattedTimePart = timePart.slice(0, 5);
    return { date: datePart, time: formattedTimePart };
  } catch (error) {
    return undefined;
  }
};

export const getDag = (workflow_type: string): string | undefined => {
  switch (workflow_type) {
    case WorkflowTypes.AUTHOR_CREATE:
      return 'author_create_initialization_dag';
    case WorkflowTypes.AUTHOR_UPDATE:
      return 'author_update_dag';
    case WorkflowTypes.HEP_CREATE:
      return 'hep_create_dag';
    default:
      return undefined;
  }
};
