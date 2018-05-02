import React from 'react';
import { shallow } from 'enzyme';

import CheckboxItem from '../CheckboxItem';

describe('CheckboxItem', () => {
  it('render initial state with all props set', () => {
    const wrapper = shallow((
      <CheckboxItem
        onChange={jest.fn()}
        checked
      >
        Test
      </CheckboxItem>
    ));
    expect(wrapper).toMatchSnapshot();
  });

  describe('onChange', () => {
    it('sets state and calls onChange if present', () => {
      const onChange = jest.fn();
      const wrapper = shallow((
        <CheckboxItem
          onChange={onChange}
          checked
        >
          Test
        </CheckboxItem>
      ));
      wrapper.instance().onChange({ target: { checked: true } });
      expect(wrapper.instance().state.checked).toBe(true);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('sets state only if present onChange is absent', () => {
      const wrapper = shallow((
        <CheckboxItem
          checked
        >
          Test
        </CheckboxItem>
      ));
      wrapper.instance().onChange({ target: { checked: true } });
      expect(wrapper.instance().state.checked).toBe(true);
    });
  });
});
