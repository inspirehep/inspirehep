import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import ContactList from '../ContactList';

describe('ContactList', () => {
  it('renders with contacts with both email and name', () => {
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
    const wrapper = shallow(<ContactList contacts={contactDetails} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with contacts with record and name', () => {
    const contactDetails = fromJS([
      {
        name: 'John',
        record: { $ref: 'http://inspirehep.net/api/authors/12345' },
      },
    ]);
    const wrapper = shallow(<ContactList contacts={contactDetails} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with contacts with only email or name', () => {
    const contactDetails = fromJS([
      {
        email: 'johndoe@yahoo.com',
      },
      {
        name: 'John2',
      },
    ]);
    const wrapper = shallow(<ContactList contacts={contactDetails} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
