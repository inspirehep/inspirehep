import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LatexTextareaWidget from '../LatexTextareaWidget';
import { buildWidgetProps } from './buildWidgetProps';

describe('LatexTextareaWidget', () => {
  it('renders the LaTeX and no textarea when the field is not focused', () => {
    render(
      <LatexTextareaWidget
        {...buildWidgetProps({ value: 'energy $E=mc^2$' })}
      />
    );

    expect(
      screen.getByTestId('latex-preview').querySelector('.katex')
    ).not.toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('switches to a textarea with the raw value when clicked', async () => {
    const user = userEvent.setup();
    render(
      <LatexTextareaWidget
        {...buildWidgetProps({ value: 'energy $E=mc^2$' })}
      />
    );

    await user.click(screen.getByTestId('latex-preview'));

    expect(screen.getByRole('textbox')).toHaveValue('energy $E=mc^2$');
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.queryByTestId('latex-preview')).toBeNull();
  });

  it('switches to a textarea when focused with the keyboard', async () => {
    const user = userEvent.setup();
    render(<LatexTextareaWidget {...buildWidgetProps({ value: 'abc' })} />);

    await user.tab();

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('goes back to the LaTeX rendering on blur and calls onBlur', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <LatexTextareaWidget {...buildWidgetProps({ value: 'abc', onBlur })} />
    );

    await user.click(screen.getByTestId('latex-preview'));
    await user.tab();

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByTestId('latex-preview')).toBeInTheDocument();
    expect(onBlur).toHaveBeenCalledWith('test', 'abc');
  });

  it('shows an editable textarea when the value is empty', () => {
    render(<LatexTextareaWidget {...buildWidgetProps({ value: undefined })} />);

    expect(screen.getByRole('textbox')).toBeEnabled();
    expect(screen.queryByTestId('latex-preview')).toBeNull();
  });

  it('calls onChange with the typed text, and undefined when cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <LatexTextareaWidget {...buildWidgetProps({ value: '', onChange })} />
    );

    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenLastCalledWith('a');

    rerender(
      <LatexTextareaWidget {...buildWidgetProps({ value: 'a', onChange })} />
    );
    await user.clear(screen.getByRole('textbox'));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('does not switch to edit mode when readonly', async () => {
    const user = userEvent.setup();
    render(
      <LatexTextareaWidget
        {...buildWidgetProps({ value: 'abc', readonly: true })}
      />
    );

    await user.click(screen.getByTestId('latex-preview'));

    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
