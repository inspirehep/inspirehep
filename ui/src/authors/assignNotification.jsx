import { notification } from 'antd';
import React from 'react';

import { AUTHORS } from '../common/routes';
// TODO: rename ExternalLink
// becuase it's used also for internal links that we want to open in a new tab
import ExternalLink from '../common/components/ExternalLink';

// to render notification over the drawer, if one is open.
const ASSIGNING_NOTIFICATION_KEY = 'assigning-notification';

export function assigning() {
  notification.info({
    key: ASSIGNING_NOTIFICATION_KEY,
    message: 'Claiming...',
    description: 'We are processing your request',
    duration: null,
  });
}

export function assignSuccess({ from, to, papers }) {
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message: 'Claim Successful!',
    duration: null,
    description: (
      <span>
        Selected papers ({papers}) moved from{' '}
        <ExternalLink target="_blank" href={`${AUTHORS}/${from}`}>
          {from}
        </ExternalLink>{' '}
        to{' '}
        <ExternalLink target="_blank" href={`${AUTHORS}/${to}`}>
          {to}
        </ExternalLink>.
      </span>
    ),
  });
}

export function assignError() {
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.error({
    className: 'super-zindex',
    message: 'Claim Error!',
    description: 'Something went wrong.',
  });
}
