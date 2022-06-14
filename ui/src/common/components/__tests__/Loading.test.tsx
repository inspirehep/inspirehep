import React from 'react';
import { shallow } from 'enzyme';

import Loading from '../Loading';

describe('Loading', () => {
  it('render loading component', () => {
    const wrapper = shallow(<Loading />);
    expect(wrapper).toMatchSnapshot();
  });
});
