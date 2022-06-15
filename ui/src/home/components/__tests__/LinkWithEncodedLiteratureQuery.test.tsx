import React from 'react';
import { shallow } from 'enzyme';
import LinkWithEncodedLiteratureQuery from '../LinkWithEncodedLiteratureQuery';

describe('LinkWithEncodedLiteratureQuery', () => {
  it('renders the component with special characters', () => {
    const query = 'this is an encoded query , / ? : @ & = + $ #';
    const wrapper = shallow(<LinkWithEncodedLiteratureQuery query={query} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('renders the component without special characters', () => {
    const query = 'this is a query';
    const wrapper = shallow(<LinkWithEncodedLiteratureQuery query={query} />);
    expect(wrapper).toMatchSnapshot();
  });
});
