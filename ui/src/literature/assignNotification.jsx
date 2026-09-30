import { notification } from 'antd';

import { CONFERENCES } from '../common/routes';
import LinkWithTargetBlank from '../common/components/LinkWithTargetBlank';
import { pluralizeUnlessSingle } from '../common/utils';

// to render notification over the drawer, if one is open.
export const ASSIGNING_NOTIFICATION_KEY = 'assigning-conferences-notification';
export const ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY =
  'assigning-notification';
export const CURATING_NOTIFICATION_KEY = 'curation-notification';

export function assigning(key) {
  notification.info({
    key,
    title: 'Assigning...',
    description: 'We are processing your request',
    duration: false,
  });
}

export function curating(key) {
  notification.info({
    key,
    title: 'We are processing your request',
    duration: false,
  });
}

export function curationSuccess() {
  notification.destroy(CURATING_NOTIFICATION_KEY);
  notification.success({
    title: 'Reference Successfully Modified!',
    duration: false,
    description:
      'Your change is in effect but will be reviewed by our staff for final approval.',
  });
}

export function curationError(key) {
  notification.destroy(key);
  notification.error({
    className: 'super-zindex',
    title: 'Error!',
    description: 'Something went wrong.',
  });
}

export function assignSuccess({ conferenceId, conferenceTitle, papers }) {
  notification.destroy(ASSIGNING_NOTIFICATION_KEY);
  notification.success({
    title: 'Assignment Successful!',
    duration: false,
    description: (
      <span>
        {papers.size} selected {pluralizeUnlessSingle('paper', papers.size)}{' '}
        assigned to{' '}
        <LinkWithTargetBlank href={`${CONFERENCES}/${conferenceId}`}>
          {conferenceTitle}
        </LinkWithTargetBlank>
      </span>
    ),
  });
}

export function assignLiteratureItemSuccess() {
  notification.destroy(ASSIGNING_NOTIFICATION_LITERATURE_ITEM_KEY);
  notification.success({
    title: 'Assignment Successful!',
    duration: false,
    description: '1 paper added to your profile',
  });
}

export function assignLiteratureItemError(key) {
  notification.destroy(key);
  notification.error({
    className: 'super-zindex',
    title: 'Assignment Error!',
    description: (
      <span>
        This paper cannot be claimed automatically. Please{' '}
        <a
          href="https://help.inspirehep.net/knowledge-base/contact-us"
          target="_blank"
          rel="noreferrer"
        >
          contact us
        </a>
      </span>
    ),
  });
}

export function assignError(key) {
  notification.destroy(key);
  notification.error({
    className: 'super-zindex',
    title: 'Assignment Error!',
    description: 'Something went wrong.',
  });
}

export function exportToCdsSuccess({ papers }) {
  notification.success({
    title: 'Export successful!',
    duration: false,
    description: <span>{papers.size} selected papers exported to CDS.</span>,
  });
}

export function exportToCdsError() {
  notification.destroy(ASSIGNING_NOTIFICATION_KEY);
  notification.error({
    className: 'super-zindex',
    title: 'Export to CDS Error!',
    description: 'Something went wrong.',
  });
}

export function exporting() {
  notification.info({
    title: 'Exporting to CDS...',
    description: 'We are processing your request',
    duration: false,
  });
}
