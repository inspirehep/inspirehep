import React from 'react';
import { shallow } from 'enzyme';

import FilterDropdown from '../FilterDropdown';


describe('FilterDropdown', () => {
  
  it('renders with all props set', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ placeholder: string; onSearch: any; }' is ... Remove this comment to see the full error message
      <FilterDropdown placeholder="placeholder text" onSearch={jest.fn()} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('should focus the input element if the focused prop is true', () => {
    const wrapper = shallow(
      <FilterDropdown
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ placeholder: string; onSearch: any; focuse... Remove this comment to see the full error message
        placeholder="placeholder text"
        
        onSearch={jest.fn()}
        focused
      />
    );
    const mockInputObj = wrapper.find('input');
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'focus' does not exist on type 'ShallowWr... Remove this comment to see the full error message
    mockInputObj.focus = jest.fn();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'focusInputIfPropFocusedSet' does not exi... Remove this comment to see the full error message
    wrapper.instance().focusInputIfPropFocusedSet(mockInputObj);
    
    expect(mockInputObj.focus).toHaveBeenCalled();
  });

  
  it('should not focus the input element if the focused prop is false', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ placeholder: string; onSearch: any; }' is ... Remove this comment to see the full error message
      <FilterDropdown placeholder="placeholder text" onSearch={jest.fn()} />
    );
    const mockInputObj = wrapper.find('input');
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'focus' does not exist on type 'ShallowWr... Remove this comment to see the full error message
    mockInputObj.focus = jest.fn();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'focusInputIfPropFocusedSet' does not exi... Remove this comment to see the full error message
    wrapper.instance().focusInputIfPropFocusedSet(mockInputObj);
    
    expect(mockInputObj.focus).not.toHaveBeenCalled();
  });
});
