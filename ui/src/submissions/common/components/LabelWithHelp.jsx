import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HelpIconTooltip from '../../../common/components/HelpIconTooltip';

class LabelWithHelp extends Component {
  render() {
    const { help, label } = this.props;
    return (
      <span>
        {label}&nbsp;
        {<HelpIconTooltip help={help} />}
      </span>
    );
  }
}

LabelWithHelp.propTypes = {
  label: PropTypes.string.isRequired,
  help: PropTypes.string.isRequired,
};

export default LabelWithHelp;
