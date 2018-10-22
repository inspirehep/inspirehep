import React from 'react';
import { shallow } from 'enzyme';

import SortBy from '../SortBy';

describe('SortBy', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(
      <SortBy sort="mostrecent" onSortChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
