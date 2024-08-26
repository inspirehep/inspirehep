import React from 'react';
import {
  WarningOutlined,
  CheckOutlined,
  HourglassOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

import storage from '../../common/storage';
import { BACKOFFICE_LOGIN, HOLDINGPEN_LOGIN_NEW } from '../../common/routes';

export const COLLECTIONS: Record<string, string> = {
  AUTHOR_CREATE: 'new authors',
  AUTHOR_UPDATE: 'author updates',
  HEP_CREATE: 'new literature submissions',
};

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
