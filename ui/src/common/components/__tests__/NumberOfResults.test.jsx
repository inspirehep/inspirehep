import React from 'react';
import { shallow } from 'enzyme';

import NumberOfResults from '../NumberOfResults';

describe('NumberOfResults', () => {
  it('renders with plural suffix if it is more than 1', () => {
    const wrapper = shallow(<NumberOfResults numberOfResults={27276} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with plural suffix if it is 0', () => {
    const wrapper = shallow(<NumberOfResults numberOfResults={0} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with singular suffix if it is 1', () => {
    const wrapper = shallow(<NumberOfResults numberOfResults={1} />);
    expect(wrapper).toMatchSnapshot();
  });
});
