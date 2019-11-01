import React from 'react';
import { shallow } from 'enzyme';

import InterventionBanner from '../InterventionBanner';

describe('InterventionBanner', () => {
  beforeEach(() => {
    global.CONFIG = {};
  });

  it('does not render when REACT_APP_INTERVENTION_BANNER is not set in config', () => {
    const wrapper = shallow(<InterventionBanner />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when REACT_APP_INTERVENTION_BANNER is set to null', () => {
    global.CONFIG = {
      REACT_APP_INTERVENTION_BANNER: null,
    };
    const wrapper = shallow(<InterventionBanner />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with the content of REACT_APP_INTERVENTION_BANNER set in config', () => {
    global.CONFIG = {
      REACT_APP_INTERVENTION_BANNER: {
        message: 'Maintenance in progress',
        link: 'https://inspirehep.net',
      },
    };
    const wrapper = shallow(<InterventionBanner />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with the content of REACT_APP_INTERVENTION_BANNER set in config (only message)', () => {
    global.CONFIG = {
      REACT_APP_INTERVENTION_BANNER: { message: 'Maintenance in progress' },
    };
    const wrapper = shallow(<InterventionBanner />);
    expect(wrapper).toMatchSnapshot();
  });
});
