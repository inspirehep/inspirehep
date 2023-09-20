import React from 'react';
import HelpIconTooltip from './HelpIconTooltip';

    const LabelWithHelp = ({ help, label }: { help: string | JSX.Element, label: string }) => {
    return (
      <span>
        {label} <HelpIconTooltip help={help} />
      </span>
    );
    };

export default LabelWithHelp;
