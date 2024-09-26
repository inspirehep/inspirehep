import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Institution from '../Institution';

describe('Institution', () => {
  it('renders if institution has name', () => {
    const institution = fromJS({
      name: 'CERN',
    });
    const wrapper = shallow(<Institution institution={institution} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders empty if instution does not has name', () => {
    const institution = fromJS({});
    const wrapper = shallow(<Institution institution={institution} />);
    expect(wrapper).toMatchSnapshot();
  });
});
