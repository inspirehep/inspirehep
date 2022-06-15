import React from 'react';
import { shallow } from 'enzyme';

import NumberOfResults from '../NumberOfResults';


describe('NumberOfResults', () => {
  
  it('renders with plural suffix if it is more than 1', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfResults numberOfResults={27276} />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with plural suffix if it is 0', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfResults numberOfResults={0} />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with singular suffix if it is 1', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfResults numberOfResults={1} />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
