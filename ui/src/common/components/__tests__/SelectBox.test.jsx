import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SelectBox from '../SelectBox';

describe('SelectBox', () => {
  it('render initial state with all props set', () => {
    const options = [
      { value: 'value1', display: 'Value 1' },
      { value: 'value2', display: 'Value 2' },
    ];

    const { getByText, asFragment } = render(
      <SelectBox
        defaultValue={options[0].value}
        onChange={jest.fn()}
        options={options}
      />
    );

    expect(getByText('Value 1')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onChange when select change', async () => {
    const user = userEvent.setup();
    const options = [
      { value: 'value1', display: 'Value 1' },
      { value: 'value2', display: 'Value 2' },
    ];

    const onChange = jest.fn();

    const screen = render(
      <SelectBox
        defaultValue={options[0].value}
        onChange={onChange}
        options={options}
      />
    );

    const select = screen.getByTestId('select-box');

    await user.click(select);

    await user.click(screen.getByText('Value 2'));

    expect(onChange).toBeCalled();
  });
});
