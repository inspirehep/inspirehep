import React from 'react';
import { shallow } from 'enzyme';

import HelpIconTooltip from '../HelpIconTooltip';

describe('HelpIconTooltip', () => {
  it('renders with help', () => {
    const wrapper = shallow(<HelpIconTooltip help="This is the help" />);
    expect(wrapper).toMatchSnapshot();
  });
});
