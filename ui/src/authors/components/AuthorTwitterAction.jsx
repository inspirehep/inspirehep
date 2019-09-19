import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import ExternalLink from '../../common/components/ExternalLink';

class AuthorTwitterAction extends Component {
  render() {
    const { twitter } = this.props;
    const href = `//twitter.com/${twitter}`;
    return (
      <ListItemAction>
        <Tooltip title="Twitter">
          <ExternalLink href={href}>
            <Icon type="twitter" />
          </ExternalLink>
        </Tooltip>
      </ListItemAction>
    );
  }
}

AuthorTwitterAction.propTypes = {
  twitter: PropTypes.string.isRequired,
};

export default AuthorTwitterAction;
