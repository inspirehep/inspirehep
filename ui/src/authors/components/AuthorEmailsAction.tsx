import React from 'react';
import { List } from 'immutable';
import { MailOutlined } from '@ant-design/icons';
import { Menu, Tooltip } from 'antd';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function getHrefForEmail(email: $TSFixMe) {
  return `mailto:${email.get('value')}`;
}

function renderEmailsDropdownAction(email: $TSFixMe) {
  return (
    <Menu.Item key={email.get('value')}>
      <ExternalLink href={getHrefForEmail(email)}>
        {email.get('value')}
      </ExternalLink>
    </Menu.Item>
  );
}

function renderEmailAction(email: $TSFixMe, title: $TSFixMe) {
  return <ExternalLink href={getHrefForEmail(email)}>{title}</ExternalLink>;
}

const ACTION_TITLE = (
  <Tooltip title="Contact author">
    <MailOutlined />
  </Tooltip>
);

type Props = {
    emails: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function AuthorEmailsAction({ emails }: Props) {
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
