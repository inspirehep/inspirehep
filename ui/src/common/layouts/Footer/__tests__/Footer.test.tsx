import React from 'react';
import { shallow } from 'enzyme';

import Footer from '../Footer';

describe('Footer', () => {
  it('renders when cataloger', () => {
    const wrapper = shallow(<Footer isCatalogerLoggedIn />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when not cataloger', () => {
    const wrapper = shallow(<Footer isCatalogerLoggedIn={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
