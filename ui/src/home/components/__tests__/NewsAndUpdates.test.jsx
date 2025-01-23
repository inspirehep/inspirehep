import React from 'react';
import { shallow } from 'enzyme';

import NewsAndUpdates from '../NewsAndUpdates';

describe('NewsAndUpdates', () => {
  it('renders', () => {
    const wrapper = shallow(<NewsAndUpdates />);
    expect(wrapper).toMatchSnapshot();
  });
});
