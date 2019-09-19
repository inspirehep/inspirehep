import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import ExternalLink from '../../common/components/ExternalLink';

class AuthorLinkedinAction extends Component {
  render() {
    const { linkedin } = this.props;
    const href = `//linkedin.com/in/${linkedin}`;
    return (
      <ListItemAction>
        <Tooltip title="LinkedIn">
          <ExternalLink href={href}>
            <Icon type="linkedin" />
          </ExternalLink>
        </Tooltip>
      </ListItemAction>
    );
  }
}

AuthorLinkedinAction.propTypes = {
  linkedin: PropTypes.string.isRequired,
};

export default AuthorLinkedinAction;
