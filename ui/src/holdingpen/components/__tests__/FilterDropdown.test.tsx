import React from 'react';
import { shallow } from 'enzyme';

import FilterDropdown from '../FilterDropdown';

describe('FilterDropdown', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(
      <FilterDropdown placeholder="placeholder text" onSearch={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should focus the input element if the focused prop is true', () => {
    const wrapper = shallow(
      <FilterDropdown
        placeholder="placeholder text"
        onSearch={jest.fn()}
        focused
      />
    );
    const mockInputObj = wrapper.find('input');
    mockInputObj.focus = jest.fn();
    wrapper.instance().focusInputIfPropFocusedSet(mockInputObj);
    expect(mockInputObj.focus).toHaveBeenCalled();
  });

  it('should not focus the input element if the focused prop is false', () => {
    const wrapper = shallow(
      <FilterDropdown placeholder="placeholder text" onSearch={jest.fn()} />
    );
    const mockInputObj = wrapper.find('input');
    mockInputObj.focus = jest.fn();
    wrapper.instance().focusInputIfPropFocusedSet(mockInputObj);
    expect(mockInputObj.focus).not.toHaveBeenCalled();
  });
});
