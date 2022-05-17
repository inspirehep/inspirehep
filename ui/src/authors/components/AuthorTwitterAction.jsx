import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TwitterOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

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
            <TwitterOutlined />
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
