import React, { Component } from 'react';
import { LinkedinOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

type Props = {
    linkedin: string;
};

class AuthorLinkedinAction extends Component<Props> {

  render() {
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

export default AuthorLinkedinAction;
