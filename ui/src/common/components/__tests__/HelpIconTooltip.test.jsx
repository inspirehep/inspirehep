import { render } from '@testing-library/react';
import HelpIconTooltip from '../HelpIconTooltip';

describe('HelpIconTooltip', () => {
  it('renders with help', () => {
    const { asFragment } = render(<HelpIconTooltip help="This is the help" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
