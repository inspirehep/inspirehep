import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { MailOutlined } from '@ant-design/icons';
import { Menu, Tooltip } from 'antd';

// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function getHrefForEmail(email: any) {
  return `mailto:${email.get('value')}`;
}

function renderEmailsDropdownAction(email: any) {
  return (
    <Menu.Item key={email.get('value')}>
      <ExternalLink href={getHrefForEmail(email)}>
        {email.get('value')}
      </ExternalLink>
    </Menu.Item>
  );
}

function renderEmailAction(email: any, title: any) {
  return <ExternalLink href={getHrefForEmail(email)}>{title}</ExternalLink>;
}

const ACTION_TITLE = (
  <Tooltip title="Contact author">
    <MailOutlined />
  </Tooltip>
);

function AuthorEmailsAction({
  emails
}: any) {
  return (
    <ActionsDropdownOrAction
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      values={emails}
      renderAction={renderEmailAction}
      renderDropdownAction={renderEmailsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

AuthorEmailsAction.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  emails: PropTypes.instanceOf(List).isRequired,
};

export default AuthorEmailsAction;
