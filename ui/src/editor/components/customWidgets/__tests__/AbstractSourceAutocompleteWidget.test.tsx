import MockAdapter from 'axios-mock-adapter';
import { WidgetProps } from '@rjsf/utils';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { buildWidgetProps } from './buildWidgetProps';
import http from '../../../../common/http';
import AbstractSourceAutocompleteWidget from '../AbstractSourceAutocompleteWidget';

const mockHttp = new MockAdapter((http as any).httpClient);

function ControlledWidget({
  widgetProps,
}: {
  widgetProps: Partial<WidgetProps>;
}) {
  const { onChange: onChangeSpy, ...rest } = widgetProps;
  const [value, setValue] = useState('');

  const onChange: WidgetProps['onChange'] = (newValue, ...args) => {
    setValue(newValue);
    onChangeSpy?.(newValue, ...args);
  };

  return (
    <AbstractSourceAutocompleteWidget
      {...buildWidgetProps({ ...rest, value, onChange })}
    />
  );
}

describe('AbstractSourceAutocompleteWidget', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('calls onChange with the raw typed value', async () => {
    const user = userEvent.setup();
    mockHttp
      .onGet('/literature/_suggest?abstract_source=A')
      .replyOnce(200, { abstract_source: [{ options: [] }] });
    const onChange = vi.fn();

    render(<ControlledWidget widgetProps={{ onChange }} />);
    await user.type(screen.getByRole('combobox'), 'A');

    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('selecting a suggestion sets the source text', async () => {
    const user = userEvent.setup();
    mockHttp.onGet('/literature/_suggest?abstract_source=Spr').replyOnce(200, {
      abstract_source: [{ options: [{ text: 'Springer' }] }],
    });
    const onChange = vi.fn();

    render(<ControlledWidget widgetProps={{ onChange }} />);
    await user.type(screen.getByRole('combobox'), 'Spr');
    // antd also renders an a11y copy of each option, so target the visible one
    const options = await screen.findAllByText('Springer');
    await user.click(
      options.find((option) =>
        option.closest('.ant-select-item-option-content')
      ) as HTMLElement
    );

    expect(onChange).toHaveBeenLastCalledWith('Springer');
  });

  it('is disabled when readonly', () => {
    render(<ControlledWidget widgetProps={{ readonly: true }} />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
