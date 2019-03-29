import React, { Component } from 'react';
import { Tag } from 'antd';
import classnames from 'classnames';

import './UnclickableTag.scss';

class UnclickableTag extends Component {
  render() {
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
