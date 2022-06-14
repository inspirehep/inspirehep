import React, { Component } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';

class HelpIconTooltip extends Component {
  render() {
    const { help } = this.props;
    return (
      <Tooltip title={help}>
        <QuestionCircleOutlined />
      </Tooltip>
    );
  }
}

HelpIconTooltip.propTypes = {
  help: PropTypes.node,
};

HelpIconTooltip.defaultProps = {
  help: null,
};

export default HelpIconTooltip;
