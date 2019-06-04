import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import Contact from '../Contact';

describe('Contact', () => {
  it('renders with contactDetails', () => {
    const contactDetails = fromJS([
      {
        email: 'johndoe@yahoo.com',
        name: 'John',
      },
      {
        email: 'johndoe2@yahoo.com',
        name: 'John2',
      },
    ]);
    const wrapper = shallow(<Contact contactDetails={contactDetails} />);
    expect(wrapper).toMatchSnapshot();
  });
});
