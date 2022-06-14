import React from 'react';
import { shallow } from 'enzyme';

import SecondaryButton from '../SecondaryButton';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SecondaryButton', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders button', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SecondaryButton onClick={jest.fn()}>Test</SecondaryButton>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onClick when button is clicked', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onClick = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SecondaryButton onClick={onClick}>Test</SecondaryButton>
    );
    wrapper.find('button').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
