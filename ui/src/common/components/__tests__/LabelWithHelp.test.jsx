import { fireEvent, render, screen } from '@testing-library/react';

import LabelWithHelp from '../LabelWithHelp';

describe('LabelWithHelp', () => {
  it('renders label with help', async () => {
    render(<LabelWithHelp label="Label" help="This is the help" />);
    const helpIcon = screen.getByRole('img', { name: /question-circle/i });
    fireEvent.mouseOver(helpIcon);
    const tooltip = await screen.findByText('This is the help');
    expect(tooltip).toBeInTheDocument();
  });
});
