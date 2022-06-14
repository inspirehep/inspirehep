import React, { Component } from 'react';
import { Tag } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import classnames from 'classnames';

import './UnclickableTag.scss';

class UnclickableTag extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
    const { className, ...otherProps } = this.props;

    return (
      <Tag
        className={classnames('__UnclickableTag__', className)}
        {...otherProps}
      />
    );
  }
}

export default UnclickableTag;
