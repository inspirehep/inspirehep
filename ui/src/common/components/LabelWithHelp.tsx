import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HelpIconTooltip from './HelpIconTooltip';

class LabelWithHelp extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'help' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { help, label } = this.props;
    return (
      <span>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        {label} {<HelpIconTooltip help={help} />}
      </span>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LabelWithHelp.propTypes = {
  label: PropTypes.node.isRequired,
  help: PropTypes.node.isRequired,
};

export default LabelWithHelp;
