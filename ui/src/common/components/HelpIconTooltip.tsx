import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

type OwnProps = {
    help?: React.ReactNode;
};

type Props = OwnProps & typeof HelpIconTooltip.defaultProps;

class HelpIconTooltip extends Component<Props> {

static defaultProps = {
    help: null,
};

  render() {
    const { help } = this.props;
    return (
      <Tooltip title={help}>
        <QuestionCircleOutlined />
      </Tooltip>
    );
  }
}

export default HelpIconTooltip;
