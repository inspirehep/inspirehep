import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Institution from '../Institution';


describe('Institution', () => {
  
  it('renders if institution has name', () => {
    const institution = fromJS({
      name: 'CERN',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Institution institution={institution} />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders empty if instution does not has name', () => {
    const institution = fromJS({});
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Institution institution={institution} />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
