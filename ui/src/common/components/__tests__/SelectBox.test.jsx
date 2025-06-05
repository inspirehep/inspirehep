import React from 'react';
import { render, fireEvent } from '@testing-library/react';

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

  it('calls onChange when select change', () => {
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

    // https://github.com/ant-design/ant-design/issues/22074#issuecomment-603735566
    const select = document.querySelector('.ant-select-selector');
    const clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent('mousedown', true, true);
    select.dispatchEvent(clickEvent);

    fireEvent.click(screen.getByText('Value 2'));

    expect(onChange).toBeCalled();
  });
});
