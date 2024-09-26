import React from 'react';
import { List, Map } from 'immutable';
import { MailOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';
import EventTracker from '../../common/components/EventTracker';

function getHrefForEmail(email: Map<string, string>) {
  return `mailto:${email.get('value')}`;
}

function renderEmailsDropdownAction(email: Map<string, string>) {
  return {
    key: email.get('value'),
    label: (
      <span key={email.get('value')}>
        <EventTracker
          eventCategory="Author detail"
          eventAction="Mail"
          eventId="Contact author"
        >
          <LinkWithTargetBlank href={getHrefForEmail(email)}>
            {email.get('value')}
          </LinkWithTargetBlank>
        </EventTracker>
      </span>
    ),
  };
}

function renderEmailAction(email: Map<string, string>, title: string) {
  return (
    <EventTracker
      eventCategory="Author detail"
      eventAction="Mail"
      eventId="Contact author"
    >
      <LinkWithTargetBlank href={getHrefForEmail(email)}>
        {title}
      </LinkWithTargetBlank>
    </EventTracker>
  );
}

const ACTION_TITLE = (
  <Tooltip title="Contact author">
    <MailOutlined />
  </Tooltip>
);

function AuthorEmailsAction({ emails }: { emails: List<string> }) {
  return (
    <ActionsDropdownOrAction
      values={emails}
      renderAction={renderEmailAction}
      renderDropdownAction={renderEmailsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

export default AuthorEmailsAction;
