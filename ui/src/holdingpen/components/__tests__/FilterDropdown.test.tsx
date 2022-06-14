import React from 'react';
import { shallow } from 'enzyme';

import FilterDropdown from '../FilterDropdown';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('FilterDropdown', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
      <FilterDropdown placeholder="placeholder text" onSearch={jest.fn()} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should focus the input element if the focused prop is true', () => {
    const wrapper = shallow(
      <FilterDropdown
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
        placeholder="placeholder text"
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
        onSearch={jest.fn()}
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'boolean' is not assignable to type 'never'.
        focused
      />
    );
    const mockInputObj = wrapper.find('input');
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    (mockInputObj as $TSFixMe).focus = jest.fn();
    (wrapper.instance() as $TSFixMe).focusInputIfPropFocusedSet(mockInputObj);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect((mockInputObj as $TSFixMe).focus).toHaveBeenCalled();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not focus the input element if the focused prop is false', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
      <FilterDropdown placeholder="placeholder text" onSearch={jest.fn()} />
    );
    const mockInputObj = wrapper.find('input');
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    (mockInputObj as $TSFixMe).focus = jest.fn();
    (wrapper.instance() as $TSFixMe).focusInputIfPropFocusedSet(mockInputObj);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect((mockInputObj as $TSFixMe).focus).not.toHaveBeenCalled();
  });
});
