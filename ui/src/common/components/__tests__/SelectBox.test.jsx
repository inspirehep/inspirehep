import React from 'react';
import { shallow } from 'enzyme';
import { Select } from 'antd';

import SelectBox from '../SelectBox';

describe('SelectBox', () => {
  it('render initial state with all props set', () => {
    const options = [
      { value: 'value1', display: 'Value 1' },
      { value: 'value2', display: 'Value 2' },
    ];
    const wrapper = shallow(
      <SelectBox
        defaultValue={options[0].value}
        onChange={jest.fn()}
        options={options}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onChange when select change', () => {
    const options = [
      { value: 'value1', display: 'Value 1' },
      { value: 'value1', display: 'Value 1' },
    ];
    const onChange = jest.fn();
    const wrapper = shallow(
      <SelectBox
        defaultValue={options[0].value}
        onChange={onChange}
        options={options}
      />
    );
    const onSelectChange = wrapper.find(Select).prop('onChange');
    onSelectChange(options[1].value);
    expect(onChange).toBeCalledWith(options[1].value);
  });
});
