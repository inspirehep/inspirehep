import { notification } from 'antd';
import React from 'react';

import { AUTHORS } from '../common/routes';
// TODO: rename ExternalLink
// becuase it's used also for internal links that we want to open in a new tab
import ExternalLink from '../common/components/ExternalLink';

// to render notification over the drawer, if one is open.
const getContainer = () =>
  document.querySelector('.ant-drawer-open') || document.body;

export function assignSuccess({ from, to, papers }) {
  notification.success({
    message: 'Claim Successful!',
    getContainer,
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
  notification.error({
    message: 'Claim Error!',
    getContainer,
    description: 'Something went wrong.',
  });
}
