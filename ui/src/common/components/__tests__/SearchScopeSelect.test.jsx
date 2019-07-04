import React from 'react';
import { shallow } from 'enzyme';

import SearchScopeSelect from '../SearchScopeSelect';
import SelectBox from '../SelectBox';

describe('SearchScopeSelect', () => {
  it('render initial state with all props set', () => {
    const wrapper = shallow(
      <SearchScopeSelect
        onSearchScopeChange={jest.fn()}
        searchScopeName="authors"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSearchScopeChange on select change', () => {
    const onSearchScopeChange = jest.fn();
    const wrapper = shallow(
      <SearchScopeSelect
        searchScopeName="literature"
        onSearchScopeChange={onSearchScopeChange}
      />
    );
    const onSelectChange = wrapper.find(SelectBox).prop('onChange');
    const newScope = 'authors';
    onSelectChange(newScope);
    expect(onSearchScopeChange).toBeCalledWith(newScope);
  });
});
