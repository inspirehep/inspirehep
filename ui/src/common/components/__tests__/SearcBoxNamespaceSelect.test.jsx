import React from 'react';
import { shallow } from 'enzyme';

import SearchBoxNamespaceSelect from '../SearchBoxNamespaceSelect';
import SelectBox from '../SelectBox';

describe('SearchBoxNamespaceSelect', () => {
  it('render initial state with all props set', () => {
    const wrapper = shallow(
      <SearchBoxNamespaceSelect
        onSearchScopeChange={jest.fn()}
        searchScopeName="authors"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSearchScopeChange on select change', () => {
    const onSearchScopeChange = jest.fn();
    const wrapper = shallow(
      <SearchBoxNamespaceSelect
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
