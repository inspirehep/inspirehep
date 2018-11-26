import React, { Component } from 'react';
import { Tooltip, Icon } from 'antd';
import PropTypes from 'prop-types';

class HelpIconTooltip extends Component {
  render() {
    const { help } = this.props;
    return (
      <Tooltip title={help}>
        <Icon type="question-circle-o" />
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
