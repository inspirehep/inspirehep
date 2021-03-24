import { notification } from 'antd';
import React from 'react';

import { CONFERENCES } from '../common/routes';
// TODO: rename ExternalLink
// becuase it's used also for internal links that we want to open in a new tab
import ExternalLink from '../common/components/ExternalLink.tsx';

// to render notification over the drawer, if one is open.
const ASSIGNING_NOTIFICATION_KEY = 'assigning-conferences-notification';

export function assigning() {
  notification.info({
    key: ASSIGNING_NOTIFICATION_KEY,
    message: 'Assigning...',
    description: 'We are processing your request',
    duration: null,
  });
}

export function assignSuccess({ conferenceId, conferenceTitle, papers }) {
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message: 'Assignment Successful!',
    duration: null,
    description: (
      <span>
        {papers.size} selected papers assigned to{' '}
        <ExternalLink target="_blank" href={`${CONFERENCES}/${conferenceId}`}>
          {conferenceTitle}
        </ExternalLink>
      </span>
    ),
  });
}

export function assignError() {
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.error({
    className: 'super-zindex',
    message: 'Assignment Error!',
    description: 'Something went wrong.',
  });
}
