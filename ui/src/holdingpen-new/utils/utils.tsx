import React from 'react';
import {
  WarningOutlined,
  CheckOutlined,
  HourglassOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { push } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';

import storage from '../../common/storage';
import {
  BACKOFFICE_LOGIN,
  HOLDINGPEN_LOGIN_NEW,
  HOLDINGPEN_SEARCH_NEW,
} from '../../common/routes';
import { searchQueryUpdate } from '../../actions/holdingpen';

export const COLLECTIONS = [
  {
    key: 'all collections',
    value: undefined,
  },
  {
    key: 'new authors',
    value: 'AUTHOR_CREATE',
  },
  {
    key: 'author updates',
    value: 'AUTHOR_UPDATE',
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
    default:
      return null;
  }
};

export const refreshToken = async () => {
  try {
    const res = await fetch(`${BACKOFFICE_LOGIN}refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: storage.getSync('holdingpen.refreshToken'),
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await res.json();
    storage.set('holdingpen.token', data.access);
    return data.access;
  } catch (error) {
    window.location.assign(HOLDINGPEN_LOGIN_NEW);
  }

  return null;
};

export const resolveDecision = (decision: string | number) => {
  const decisions: {
    [key: string]: { bg: string; text: string; decision: string };
  } = {
    accept: { bg: 'bg-halted ml1', text: 'Accept', decision: 'accepted' },
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
  dispatch(push(HOLDINGPEN_SEARCH_NEW));
};
