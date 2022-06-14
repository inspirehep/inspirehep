import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { MailOutlined } from '@ant-design/icons';
import { Menu, Tooltip } from 'antd';

import ExternalLink from '../../common/components/ExternalLink.tsx';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function getHrefForEmail(email) {
  return `mailto:${email.get('value')}`;
}

function renderEmailsDropdownAction(email) {
  return (
    <Menu.Item key={email.get('value')}>
      <ExternalLink href={getHrefForEmail(email)}>
        {email.get('value')}
      </ExternalLink>
    </Menu.Item>
  );
}

function renderEmailAction(email, title) {
  return <ExternalLink href={getHrefForEmail(email)}>{title}</ExternalLink>;
}

const ACTION_TITLE = (
  <Tooltip title="Contact author">
    <MailOutlined />
  </Tooltip>
);

function AuthorEmailsAction({ emails }) {
  return (
    <ActionsDropdownOrAction
      values={emails}
      renderAction={renderEmailAction}
      renderDropdownAction={renderEmailsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

AuthorEmailsAction.propTypes = {
  emails: PropTypes.instanceOf(List).isRequired,
};

export default AuthorEmailsAction;
