import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Button, Menu, Icon } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import DropdownMenu from '../../common/components/DropdownMenu';
import ExternalLink from '../../common/components/ExternalLink';

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
      <DropdownMenu title={<Button>{AuthorEmailsAction.renderIcon()}</Button>}>
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
      <ExternalLink href={AuthorEmailsAction.getHrefForEmail(emails.first())}>
        {AuthorEmailsAction.renderIcon()}
      </ExternalLink>
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
