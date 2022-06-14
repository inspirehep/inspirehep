import React, { Component } from 'react';
import { TwitterOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';

type Props = {
    twitter: string;
};

class AuthorTwitterAction extends Component<Props> {

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

export default AuthorTwitterAction;
