import React from 'react';
import {
  WarningOutlined,
  CheckOutlined,
  HourglassOutlined,
  LoadingOutlined,
  FieldTimeOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { push } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';

import storage from '../../common/storage';
import {
  BACKOFFICE_LOGIN,
  BACKOFFICE_LOGIN_API,
  BACKOFFICE_SEARCH,
} from '../../common/routes';
import { searchQueryUpdate } from '../../actions/backoffice';
import { WorkflowTypes } from '../constants';

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
    value: 'HEP_CREATE',
  },
];

export const getIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approval':
      return <HourglassOutlined className="mr2" />;
    case 'error':
      return <WarningOutlined className="mr2" />;
    case 'completed':
      return <CheckOutlined className="mr2" />;
    case 'running':
      return <LoadingOutlined className="mr2" />;
    case 'processing':
      return <FieldTimeOutlined className="mr2 processing" />;
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

export const handleSearch = (
  dispatch: ActionCreator<Action>,
  type: string,
  searchValue: string
) => {
  const query = {
    page: 1,
    search: searchValue,
    workflow_type: type,
  };

  dispatch(searchQueryUpdate(query));
  dispatch(push(BACKOFFICE_SEARCH));
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
      icon: <StopOutlined className="mr2" />,
      text: 'Waiting for approval',
      description: 'This workflow has been halted until decision is made.',
    },
    error: {
      icon: <WarningOutlined className="mr2" />,
      text: 'Error',
      description:
        'This record is in error state. View record details for more information.',
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

export const formatDateTime = (rawDateTime: string): string | undefined => {
  try {
    const isoString = new Date(rawDateTime).toISOString();
    const [datePart, timePart] = isoString.split('T');
    const formattedTimePart = timePart.slice(0, 5);
    return `${datePart} ${formattedTimePart}`;
  } catch (error) {
    return undefined;
  }
};
