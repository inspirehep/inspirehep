import React from 'react';
import { shallow } from 'enzyme';

import SearchPage from '../SearchPage';

describe('Literature - SearchPage', () => {
  it('renders with loading false', () => {
    const wrapper = shallow(<SearchPage />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with loading true', () => {
    const wrapper = shallow(<SearchPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
