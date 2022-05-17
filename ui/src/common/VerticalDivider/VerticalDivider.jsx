import React, { Component } from 'react';
import { Divider } from 'antd';

import './VerticalDivider.less';

class VerticalDivider extends Component {
  render() {
    return <Divider type="vertical" className="__VerticalDivider__" />;
  }
}

export default VerticalDivider;
