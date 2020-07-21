import React from 'react';
import { shallow } from 'enzyme';

import ClaimAction from '../ClaimAction';

describe('ClaimAction', () => {
  it('renders', () => {
    const wrapper = shallow(<ClaimAction />);
    expect(wrapper).toMatchSnapshot();
  });
});
