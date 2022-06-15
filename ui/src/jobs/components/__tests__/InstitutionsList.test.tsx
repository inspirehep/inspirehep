import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import InstitutionsList from '../InstitutionsList';


describe('InstitutionsList', () => {
  
  it('renders institutions', () => {
    const institutions = fromJS([
      {
        value: 'UC, Berkeley',
      },
      {
        value: 'CERN',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<InstitutionsList institutions={institutions} />);
    
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
