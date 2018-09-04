import React from 'react';
import { shallow } from 'enzyme';

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
});
