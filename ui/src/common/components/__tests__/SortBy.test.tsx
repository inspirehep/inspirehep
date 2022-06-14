import React from 'react';
import { shallow } from 'enzyme';

import SortBy from '../SortBy';
import SelectBox from '../SelectBox';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SortBy', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const wrapper = shallow(
      <SortBy
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        sort="mostrecent"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSortChange={jest.fn()}
        sortOptions={[{ value: 'mostrecent', display: 'Most Recent' }]}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render if sortOptions missing', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SortBy sort="mostrecent" onSortChange={jest.fn()} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onSortChange when select box change', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSortChange = jest.fn();
    const wrapper = shallow(
      <SortBy
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        sort="mostrecent"
        onSortChange={onSortChange}
        sortOptions={[{ value: 'mostrecent', display: 'Most Recent' }]}
      />
    );
    const onSelectBoxChange = wrapper.find(SelectBox).prop('onChange');
    const sort = 'mostcited';
    onSelectBoxChange(sort);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onSortChange).toBeCalledWith(sort);
  });
});
