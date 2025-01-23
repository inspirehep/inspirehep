import React from 'react';
import { notification } from 'antd';

import { AUTHORS } from '../common/routes';
import LinkWithTargetBlank from '../common/components/LinkWithTargetBlank';
import { pluralizeUnlessSingle } from '../common/utils';

type AssignActionType = 'claimed to' | 'moved to' | 'removed from';

// to render notification over the drawer, if one is open.
const ASSIGNING_NOTIFICATION_KEY = 'assigning-notification';

const resolveSuccessMessage = (
  numberOfPapers: number,
  action: AssignActionType
) =>
  `${
    numberOfPapers > 1 ? 'All ' : ''
  }${numberOfPapers} selected ${pluralizeUnlessSingle(
    'paper',
    numberOfPapers
  )} will be ${action} your profile.`;

const resolveSuccessMessageMixedPapers = (
  numberOfClaimedPapers: number,
  numberOfUnclaimedPapers: number
) =>
  `${numberOfUnclaimedPapers} ${pluralizeUnlessSingle(
    'paper',
    numberOfUnclaimedPapers
  )} will be claimed to your profile. ${numberOfClaimedPapers} ${pluralizeUnlessSingle(
    'paper',
    numberOfClaimedPapers
  )} can not be claimed.`;

export function assigning() {
  notification.info({
    key: ASSIGNING_NOTIFICATION_KEY,
    message: 'Claiming...',
    description: 'We are processing your request',
    duration: null,
  });
}

export function assignSuccess({
  from,
  to,
  literatureIds,
}: {
  from: string;
  to: string;
  literatureIds: string[];
}) {
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message: 'Processing request...',
    duration: null,
    description: (
      <span data-test-id="claim-notification-description">
        Selected papers ({literatureIds.join(', ')}) will be moved from{' '}
        <LinkWithTargetBlank href={`${AUTHORS}/${from}`}>
          {from}
        </LinkWithTargetBlank>{' '}
        to{' '}
        <LinkWithTargetBlank href={`${AUTHORS}/${to}`}>
          {to}
        </LinkWithTargetBlank>
        .
      </span>
    ),
  });
}

export function assignSuccessOwnProfile({
  numberOfClaimedPapers,
  numberOfUnclaimedPapers,
}: {
  numberOfClaimedPapers: number;
  numberOfUnclaimedPapers: number;
}) {
  const message =
    numberOfClaimedPapers === 0
      ? resolveSuccessMessage(numberOfUnclaimedPapers, 'claimed to')
      : resolveSuccessMessageMixedPapers(
          numberOfClaimedPapers,
          numberOfUnclaimedPapers
        );
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message,
    duration: null,
  });
}

export function unassignSuccessOwnProfile(numberOfPapers: number) {
  const message = resolveSuccessMessage(numberOfPapers, 'removed from');
  notification.close(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    message,
    duration: null,
  });
}

export function assignSuccessDifferentProfileUnclaimedPapers(
  numberOfUnclaimedPapers: number
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
