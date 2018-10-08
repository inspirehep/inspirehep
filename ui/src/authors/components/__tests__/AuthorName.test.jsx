import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorName from '../AuthorName';

describe('AuthorName', () => {
  it('renders with preferred_name', () => {
    const name = fromJS({ preferred_name: 'Harun Urhan' });
    const wrapper = shallow(<AuthorName name={name} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with formatted value if preffered_name is not present and value is comma separated', () => {
    const name = fromJS({ value: 'Urhan, Harun' });
    const wrapper = shallow(<AuthorName name={name} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with value if preffered_name is not present and value is not comma separated', () => {
    const name = fromJS({ value: 'Urhan Harun' });
    const wrapper = shallow(<AuthorName name={name} />);
    expect(wrapper).toMatchSnapshot();
  });
});
