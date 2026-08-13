import { forwardRef, ReactNode } from 'react';
import HelpIconTooltip from './HelpIconTooltip';

interface LabelWithHelpProps {
  label: ReactNode;
  help: ReactNode;
}

const LabelWithHelp = forwardRef<HTMLSpanElement, LabelWithHelpProps>(
  ({ help, label }, ref) => (
    <span ref={ref} data-testid="label-with-help">
      {label} <HelpIconTooltip help={help} />
    </span>
  )
);

LabelWithHelp.displayName = 'LabelWithHelp';

export default LabelWithHelp;
