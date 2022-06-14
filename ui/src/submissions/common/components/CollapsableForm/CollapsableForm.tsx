import React, { Component } from 'react';
import { Collapse } from 'antd';

import './CollapsableForm.scss';

type OwnProps = {
    openSections?: string[];
};

type Props = OwnProps & typeof CollapsableForm.defaultProps;

class CollapsableForm extends Component<Props> {

static defaultProps = {
    openSections: [],
};

  render() {
    const { openSections, ...collapseProps } = this.props;
    return (
      <Collapse
        className="__CollapsableForm__"
        bordered={false}
        {...collapseProps}
        defaultActiveKey={openSections}
      />
    );
  }
}

export default CollapsableForm;
