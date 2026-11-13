import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WrappingInputTemplate from '../WrappingInputTemplate';
import { buildWidgetProps } from '../../../customWidgets/__tests__/buildWidgetProps';

const buildProps = (overrides = {}) =>
  ({
    ...buildWidgetProps({
      registry: { formContext: {} } as any,
      schema: { type: 'string' },
      ...overrides,
    }),
    type: 'text',
  }) as any;

describe('WrappingInputTemplate', () => {
  it('renders the value in a textarea so that long text wraps', () => {
    render(<WrappingInputTemplate {...buildProps({ value: 'long text' })} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveValue('long text');
  });

  it('calls onChange with the emptyValue when cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <WrappingInputTemplate
        {...buildProps({ value: 'a', onChange, options: {} })}
      />
    );

    await user.clear(screen.getByRole('textbox'));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('does not insert new lines on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<WrappingInputTemplate {...buildProps({ value: 'a', onChange })} />);

    await user.type(screen.getByRole('textbox'), '{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });
});
