import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Advisor from '../Advisor';

describe('Advisor', () => {
  it('renders linked', () => {
    const advisor = fromJS({
      name: 'Yoda',
      record: {
        $ref: 'https://inspirehep.net/api/authors/12345',
      },
    });
    const wrapper = shallow(<Advisor advisor={advisor} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders unliked', () => {
    const advisor = fromJS({
      name: 'Yoda',
    });
    const wrapper = shallow(<Advisor advisor={advisor} />);
    expect(wrapper).toMatchSnapshot();
  });
});
