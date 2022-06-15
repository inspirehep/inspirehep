import React from 'react';
import { shallow } from 'enzyme';

import LabelWithHelp from '../LabelWithHelp';


describe('LabelWithHelp', () => {
  
  it('renders label with help', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LabelWithHelp label="Label" help="This is the help" />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
