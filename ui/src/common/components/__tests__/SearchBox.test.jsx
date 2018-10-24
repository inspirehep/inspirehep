import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'antd';

import SearchBox from '../SearchBox';

describe('SearchBox', () => {
  it('render initial state with all props set', () => {
    const wrapper = shallow(
      <SearchBox
        value="value"
        placeholder="placeholder"
        searchScopeName="scope"
        onSearch={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders new value on change', () => {
    const wrapper = shallow(<SearchBox value="value" />);
    wrapper.instance().onChange({ target: { value: 'new' } });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSearch on input search', () => {
    const onSearch = jest.fn();
    const wrapper = shallow(<SearchBox value="value" onSearch={onSearch} />);
    const onInputSearch = wrapper.find(Input.Search).prop('onSearch');
    const searchValue = 'foo';
    onInputSearch(searchValue);
    expect(onSearch).toBeCalledWith(searchValue);
  });
});
