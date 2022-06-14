import React from 'react';
import { shallow } from 'enzyme';
import FormattedNumber from '../FormattedNumber.tsx';

describe('FormattedNumber', () => {
  it('renders with children', () => {
    const wrapper = shallow(<FormattedNumber>{1243553}</FormattedNumber>);
    expect(wrapper).toMatchSnapshot();
  });
});
