import React, { Component } from 'react';
import HelpIconTooltip from './HelpIconTooltip';

type Props = {
    label: React.ReactNode;
    help: React.ReactNode;
};

class LabelWithHelp extends Component<Props> {

  render() {
    const { help, label } = this.props;
    return (
      <span>
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        {label} {<HelpIconTooltip help={help} />}
      </span>
    );
  }
}

export default LabelWithHelp;
