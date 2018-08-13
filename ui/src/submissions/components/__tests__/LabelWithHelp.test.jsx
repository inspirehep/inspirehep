import React from 'react';
import { shallow } from 'enzyme';

import LabelWithHelp from '../LabelWithHelp';

describe('LabelWithHelp', () => {
  it('renders label with help', () => {
    const wrapper = shallow(
      <LabelWithHelp label="Label" help="This is the help" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
