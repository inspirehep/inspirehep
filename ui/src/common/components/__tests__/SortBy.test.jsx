import React from 'react';
import { shallow } from 'enzyme';

import { render } from '@testing-library/react';
import SortBy from '../SortBy';
import SelectBox from '../SelectBox';

describe('SortBy', () => {
  it('renders with all props set', () => {
    const { getByText } = render(
      <SortBy
        sort="mostrecent"
        onSortChange={jest.fn()}
        sortOptions={[{ value: 'mostrecent', display: 'Most Recent' }]}
      />
    );

    expect(getByText('Most Recent')).toBeInTheDocument();
  });

  it('does not render if sortOptions missing', () => {
    const { queryByTestId } = render(
      <SortBy sort="mostrecent" onSortChange={jest.fn()} />
    );

    expect(queryByTestId('sort-by-select')).toBeNull();
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
