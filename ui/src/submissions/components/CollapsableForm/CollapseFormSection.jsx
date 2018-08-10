import React, { Component } from 'react';
import { Collapse } from 'antd';

class CollapsableFormSection extends Component {
  render() {
    return (
      <Collapse.Panel
        className="bg-white mb3 overflow-hidden"
        {...this.props}
      />
    );
  }
}

export default CollapsableFormSection;
