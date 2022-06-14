import React from 'react';
import { shallow } from 'enzyme';

import Banners from '../Banners';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Banners', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'CONFIG' does not exist on type 'Global &... Remove this comment to see the full error message
    global.CONFIG = {};
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders nothing if banners config not set', () => {
    const wrapper = shallow(<Banners />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
