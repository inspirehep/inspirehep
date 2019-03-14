import React from 'react';
import { shallow } from 'enzyme';

import LiteratureDate from '../LiteratureDate';

describe('LiteratureDate', () => {
  it('renders with date', () => {
    const wrapper = shallow(<LiteratureDate date="1993-06-07" />);
    expect(wrapper).toMatchSnapshot();
  });
});
