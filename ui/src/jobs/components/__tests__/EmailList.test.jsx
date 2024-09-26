import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import EmailList from '../EmailList';

describe('EmailList', () => {
  it('renders with emails', () => {
    const emails = fromJS(['johndoe@yahoo.com', 'johndoe2@yahoo.com']);
    const wrapper = shallow(<EmailList emails={emails} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
