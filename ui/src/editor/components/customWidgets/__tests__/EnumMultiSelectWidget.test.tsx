import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WidgetProps } from '@rjsf/utils';

import EnumMultiSelectWidget from '../EnumMultiSelectWidget';
import { buildWidgetProps } from './buildWidgetProps';

const enumOptions = [
  { value: 'hep-th', label: 'High Energy Physics - Theory' },
  { value: 'hep-ph', label: 'High Energy Physics - Phenomenology' },
];

function renderWidget(overrides: Partial<WidgetProps> = {}) {
  const props = buildWidgetProps({ ...overrides, options: { enumOptions } });
  return { ...render(<EnumMultiSelectWidget {...props} />), props };
}

describe('EnumMultiSelectWidget', () => {
  it('renders the already selected values as labels', () => {
    const screen = renderWidget({ value: ['hep-th'] });

    expect(screen.getByText('High Energy Physics - Theory')).toBeVisible();
  });

  it('defaults to no selection when value is undefined', () => {
    const screen = renderWidget({ value: undefined });

    expect(
      screen.queryByText('High Energy Physics - Theory')
    ).not.toBeInTheDocument();
  });

  it('calls onChange with the selected value added to the current selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const screen = renderWidget({ value: ['hep-th'], onChange });

    await user.click(screen.getByRole('combobox'));
    await user.click(
      await screen.findByText('High Energy Physics - Phenomenology')
    );

    expect(onChange).toHaveBeenCalledWith(['hep-th', 'hep-ph']);
  });

  it('calls onChange with the value removed when its tag is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const screen = renderWidget({ value: ['hep-th', 'hep-ph'], onChange });

    const removeButtons = screen.getAllByLabelText('close');

    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith(['hep-ph']);
  });

  it('is disabled when disabled is true', () => {
    const screen = renderWidget({ value: [], disabled: true });

    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('is disabled when readonly is true', () => {
    const screen = renderWidget({ value: [], readonly: true });

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
