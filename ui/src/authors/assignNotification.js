import { notification } from 'antd';
import React from 'react';

import { AUTHORS } from '../common/routes';
// TODO: rename ExternalLink
// becuase it's used also for internal links that we want to open in a new tab
import ExternalLink from '../common/components/ExternalLink.tsx';
import pluralizeUnlessSingle from '../common/utils';

// to render notification over the drawer, if one is open.
const ASSIGNING_NOTIFICATION_KEY = 'assigning-notification';

const resolveSuccessMessage = (numberOfPapers, action) =>
  `${
    numberOfPapers > 1 ? 'All ' : ''
  }${numberOfPapers} selected ${pluralizeUnlessSingle(
    'paper',
    numberOfPapers
  )} will be ${action} your profile.`;

  const resolveSuccessMessageMixedPapers = (numberOfClaimedPapers, numberOfUnclaimedPapers) =>
  `${numberOfUnclaimedPapers} ${pluralizeUnlessSingle(
    'paper',
    numberOfUnclaimedPapers
  )} will be claimed to your profile. ${numberOfClaimedPapers} ${pluralizeUnlessSingle(
    'paper',
    numberOfClaimedPapers
  )} can not be claimed.`

export function assigning() {
  notification.info({
    key: ASSIGNING_NOTIFICATION_KEY,
    message: 'Claiming...',
    description: 'We are processing your request',
    duration: null,
  });
}

export function assignSuccess({ from, to, literatureIds }) {
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message: 'Processing request...',
    duration: null,
    description: (
      <span>
        Selected papers ({literatureIds}) will be moved from{' '}
        <ExternalLink target="_blank" href={`${AUTHORS}/${from}`}>
          {from}
        </ExternalLink>{' '}
        to{' '}
        <ExternalLink target="_blank" href={`${AUTHORS}/${to}`}>
          {to}
        </ExternalLink>
        .
    </span>
    ),
  });
}

export function assignSuccessOwnProfile({
  numberOfClaimedPapers,
  numberOfUnclaimedPapers,
}) {
  const message =
    numberOfClaimedPapers === 0
      ? resolveSuccessMessage(numberOfUnclaimedPapers, 'claimed to')
      : resolveSuccessMessageMixedPapers(numberOfClaimedPapers, numberOfUnclaimedPapers);
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message,
    duration: null,
  });
}

export function unassignSuccessOwnProfile(numberOfPapers) {
  const message = resolveSuccessMessage(numberOfPapers, 'removed from');
  notification.success({
    message,
    duration: null,
  });
}

export function assignSuccessDifferentProfileUnclaimedPapers(
  numberOfUnclaimedPapers
) {
  const message = resolveSuccessMessage(numberOfUnclaimedPapers, 'moved to');
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message,
    duration: null,
  });
}

export function assignSuccessDifferentProfileClaimedPapers() {
  const message = 'Some claims will be reviewed by our staff for approval.';
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message,
    duration: null,
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
