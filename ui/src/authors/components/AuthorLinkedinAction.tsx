import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LinkedinOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

class AuthorLinkedinAction extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'linkedin' does not exist on type 'Readon... Remove this comment to see the full error message
    const { linkedin } = this.props;
    const href = `//linkedin.com/in/${linkedin}`;
    return (
      <ListItemAction>
        <Tooltip title="LinkedIn">
          <ExternalLink href={href}>
            <LinkedinOutlined />
          </ExternalLink>
        </Tooltip>
      </ListItemAction>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AuthorLinkedinAction.propTypes = {
  linkedin: PropTypes.string.isRequired,
};

export default AuthorLinkedinAction;
