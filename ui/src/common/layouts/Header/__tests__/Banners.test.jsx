import React from 'react';
import { shallow } from 'enzyme';

import Banners from '../Banners';

describe('Banners', () => {
  beforeEach(() => {
    global.CONFIG = {};
  });

  it('renders nothing if banners config not set', () => {
    const wrapper = shallow(<Banners />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders banners if banners config is set', () => {
    global.CONFIG = {
      BANNERS: [
        {
          id: 'maintenance',
          message: 'Maintenance in progress',
        },
        {
          id: 'release',
          message: 'We are just out of beta',
        },
      ],
    };
    const wrapper = shallow(<Banners />);
    expect(wrapper).toMatchSnapshot();
  });
});
