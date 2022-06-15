import React from 'react';
import { shallow } from 'enzyme';

import HelpIconTooltip from '../HelpIconTooltip';


describe('HelpIconTooltip', () => {
  
  it('renders with help', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<HelpIconTooltip help="This is the help" />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
