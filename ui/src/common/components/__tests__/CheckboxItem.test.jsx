import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox } from 'antd';

import CheckboxItem from '../CheckboxItem';

describe('CheckboxItem', () => {
  it('render initial state with all props set', () => {
    const wrapper = shallow(
      <CheckboxItem onChange={jest.fn()} checked>
        Test
      </CheckboxItem>
    );
    expect(wrapper).toMatchSnapshot();
  });

  describe('onChange', () => {
    it('sets state and calls onChange if onChange is present', () => {
      const onChange = jest.fn();
      const wrapper = shallow(
        <CheckboxItem onChange={onChange} checked>
          Test
        </CheckboxItem>
      );
      wrapper.instance().onChange({ target: { checked: true } });
      expect(wrapper.state().checked).toBe(true);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('sets state only if onChange is absent', () => {
      const wrapper = shallow(<CheckboxItem checked>Test</CheckboxItem>);
      wrapper.instance().onChange({ target: { checked: true } });
      expect(wrapper.state().checked).toBe(true);
    });

    it('calls onChange when checkbox change', () => {
      const onChange = jest.fn();
      const wrapper = shallow(
        <CheckboxItem checked onChange={onChange}>
          Test
        </CheckboxItem>
      );
      const onCheckboxChange = wrapper.find(Checkbox).prop('onChange');
      const checked = true;
      onCheckboxChange({ target: { checked } });
      expect(onChange).toBeCalledWith(checked);
    });
  });
});
