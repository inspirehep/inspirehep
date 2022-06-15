import React from 'react';
import { shallow } from 'enzyme';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from '../FormattedNumber.tsx';


describe('FormattedNumber', () => {
  
  it('renders with children', () => {
    const wrapper = shallow(<FormattedNumber>{1243553}</FormattedNumber>);
    
    expect(wrapper).toMatchSnapshot();
  });
});
