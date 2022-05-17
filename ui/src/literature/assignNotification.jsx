import { notification } from 'antd';
import React from 'react';

import { CONFERENCES } from '../common/routes';
// TODO: rename ExternalLink
// becuase it's used also for internal links that we want to open in a new tab
import ExternalLink from '../common/components/ExternalLink';

// to render notification over the drawer, if one is open.
export const ASSIGNING_NOTIFICATION_KEY = 'assigning-conferences-notification';
export const ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY = 'assigning-notification';

export function assigning(key) {
  notification.info({
    key,
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
        {papers.size}
        {' '}
selected papers assigned to
        {' '}
        <ExternalLink target="_blank" href={`${CONFERENCES}/${conferenceId}`}>
          {conferenceTitle}
        </ExternalLink>
      </span>
    ),
  });
}

export function assignLiteratureItemSuccess() {
  notification.close(ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY);
  notification.success({
    message: 'Assignment Successful!',
    duration: null,
    description: '1 paper added to your profile',
  });
}

export function assignLiteratureItemError(key) {
  notification.close(key);
  notification.error({
    className: 'super-zindex',
    message: 'Assignment Error!',
    description: (
      <span>
        This paper cannot be claimed automatically. Please contact us at 
        {' '}
        {' '}
        <a href="mailto:authors@inspirehep.net">
          authors@inspirehep.net
        </a>
      </span>
    ),
  });
}

export function assignError(key) {
  notification.close(key);
  notification.error({
    className: 'super-zindex',
    message: 'Assignment Error!',
    description: 'Something went wrong.',
  });
}

export function exportToCdsSuccess({ papers }) {
  notification.success({
    message: 'Export successful!',
    duration: null,
    description: <span>
      {papers.size}
      {' '}
selected papers exported to CDS.
    </span>,
  });
}

export function exportToCdsError() {
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.error({
    className: 'super-zindex',
    message: 'Export to CDS Error!',
    description: 'Something went wrong.',
  });
}

export function exporting() {
  notification.info({
    message: 'Exporting to CDS...',
    description: 'We are processing your request',
    duration: null,
  });
}
