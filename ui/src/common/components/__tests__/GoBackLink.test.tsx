import React from 'react';
import { shallow } from 'enzyme';

import GoBackLink from '../GoBackLink';


describe('GoBackLink', () => {
  
  it('renders with default children', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<GoBackLink onClick={jest.fn()} />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with custom children', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <GoBackLink onClick={jest.fn()}>custom</GoBackLink>
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
