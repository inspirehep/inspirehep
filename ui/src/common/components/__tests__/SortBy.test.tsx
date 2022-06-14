import React from 'react';
import { shallow } from 'enzyme';

import SortBy from '../SortBy';
import SelectBox from '../SelectBox';

describe('SortBy', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(
      <SortBy
        sort="mostrecent"
        onSortChange={jest.fn()}
        sortOptions={[{ value: 'mostrecent', display: 'Most Recent' }]}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render if sortOptions missing', () => {
    const wrapper = shallow(
      <SortBy sort="mostrecent" onSortChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSortChange when select box change', () => {
    const onSortChange = jest.fn();
    const wrapper = shallow(
      <SortBy
        sort="mostrecent"
        onSortChange={onSortChange}
        sortOptions={[{ value: 'mostrecent', display: 'Most Recent' }]}
      />
    );
    const onSelectBoxChange = wrapper.find(SelectBox).prop('onChange');
    const sort = 'mostcited';
    onSelectBoxChange(sort);
    expect(onSortChange).toBeCalledWith(sort);
  });
});
