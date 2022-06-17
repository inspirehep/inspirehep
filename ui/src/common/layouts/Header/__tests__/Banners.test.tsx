import React from 'react';
import { shallow } from 'enzyme';

import Banners from '../Banners';


describe('Banners', () => {
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Global &... Remove this comment to see the full error message
    global.CONFIG = {};
  });

  
  it('renders nothing if banners config not set', () => {
    const wrapper = shallow(<Banners />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders banners if banners config is set', () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Global &... Remove this comment to see the full error message
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
