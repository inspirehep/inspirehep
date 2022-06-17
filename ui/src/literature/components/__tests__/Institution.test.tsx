import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Institution from '../Institution';

<<<<<<< Updated upstream

describe('Institution', () => {
  
=======
describe('Institution', () => {
>>>>>>> Stashed changes
  it('renders if institution has name', () => {
    const institution = fromJS({
      name: 'CERN',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Institution institution={institution} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders empty if instution does not has name', () => {
    const institution = fromJS({});
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Institution institution={institution} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
