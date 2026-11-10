import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RecordRefWidget from '../RecordRefWidget';
import { buildWidgetProps } from './buildWidgetProps';

const REF = `${window.location.origin}/api/conferences/1234`;

describe('<RecordRefWidget />', () => {
  it('renders an input with the $ref and the record link below it', () => {
    render(<RecordRefWidget {...buildWidgetProps({ value: REF })} />);

    const input = screen.getByRole('textbox');
    const link = screen.getByRole('link', { name: 'View conference' });
    expect(input).toHaveValue(REF);
    expect(link).toHaveAttribute(
      'href',
      `${window.location.origin}/conferences/1234`
    );
    expect(input.compareDocumentPosition(link)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('renders no link when empty', () => {
    render(<RecordRefWidget {...buildWidgetProps({ value: undefined })} />);

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('calls onChange with the typed value, and undefined when cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <RecordRefWidget {...buildWidgetProps({ value: '', onChange })} />
    );

    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenLastCalledWith('a');

    rerender(
      <RecordRefWidget {...buildWidgetProps({ value: 'a', onChange })} />
    );
    await user.clear(screen.getByRole('textbox'));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('renders no link while the value is not a record URL', () => {
    render(<RecordRefWidget {...buildWidgetProps({ value: 'abc' })} />);

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('is disabled when readonly', () => {
    render(
      <RecordRefWidget {...buildWidgetProps({ value: REF, readonly: true })} />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
