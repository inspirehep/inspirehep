import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'antd';

import EmbeddedSearchBox from '../EmbeddedSearchBox';

describe('ErrorAlert', () => {
  it('renders with all props', () => {
    const wrapper = shallow(
      <EmbeddedSearchBox onSearch={jest.fn()} placeholder="Type to search" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with default message', () => {
    const onSearch = jest.fn();
    const wrapper = shallow(<EmbeddedSearchBox onSearch={onSearch} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find(Input.Search).prop('onSearch')).toBe(onSearch);
  });
});
