import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Button, Menu, Icon, Tooltip } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import DropdownMenu from '../../common/components/DropdownMenu';
import ExternalLink from '../../common/components/ExternalLink';

const TOOLTIP_TITLE = 'Contact author';

class AuthorEmailsAction extends Component {
  static renderIcon() {
    return <Icon type="mail" />;
  }

  static getHrefForEmail(email) {
    return `mailto:${email.get('value')}`;
  }

  renderDropdown() {
    const { emails } = this.props;
    return (
      <DropdownMenu
        title={
          <Tooltip title={TOOLTIP_TITLE}>
            <Button>{AuthorEmailsAction.renderIcon()}</Button>
          </Tooltip>
        }
      >
        {emails.map(email => (
          <Menu.Item key={email.get('value')}>
            <ExternalLink href={AuthorEmailsAction.getHrefForEmail(email)}>
              {email.get('value')}
            </ExternalLink>
          </Menu.Item>
        ))}
      </DropdownMenu>
    );
  }

  renderOne() {
    const { emails } = this.props;
    return (
      <Tooltip title={TOOLTIP_TITLE}>
        <ExternalLink href={AuthorEmailsAction.getHrefForEmail(emails.first())}>
          {AuthorEmailsAction.renderIcon()}
        </ExternalLink>
      </Tooltip>
    );
  }

  render() {
    const { emails } = this.props;
    return (
      <ListItemAction>
        {emails.size > 1 ? this.renderDropdown() : this.renderOne()}
      </ListItemAction>
    );
  }
}

AuthorEmailsAction.propTypes = {
  emails: PropTypes.instanceOf(List).isRequired,
};

export default AuthorEmailsAction;
