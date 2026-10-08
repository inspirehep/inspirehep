import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToggleWidget from '../ToggleWidget';
import { buildWidgetProps } from './buildWidgetProps';

describe('ToggleWidget', () => {
  it('should display "name" if checked', () => {
    const props = buildWidgetProps({
      value: true,
      name: 'deleted',
    });
    render(<ToggleWidget {...props} />);

    expect(screen.getByRole('switch')).toHaveTextContent('deleted');
  });
  it('should display "not name" if not checked', () => {
    const props = buildWidgetProps({
      value: false,
      name: 'deleted',
    });
    render(<ToggleWidget {...props} />);

    expect(screen.getByRole('switch')).toHaveTextContent('not deleted');
  });
  it('should call onChange with true if checked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = buildWidgetProps({
      value: false,
      name: 'deleted',
      onChange,
    });
    render(<ToggleWidget {...props} />);

    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
  it('should call onChange with false if unchecked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const props = buildWidgetProps({
      value: true,
      name: 'deleted',
      onChange,
    });
    render(<ToggleWidget {...props} />);

    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
