import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HelpIconTooltip from './HelpIconTooltip';

class LabelWithHelp extends Component {
  render() {
    const { help, label } = this.props;
    return (
      <span>
        {label} <HelpIconTooltip help={help} />
      </span>
    );
  }
}

LabelWithHelp.propTypes = {
  label: PropTypes.node.isRequired,
  help: PropTypes.node.isRequired,
};

export default LabelWithHelp;
