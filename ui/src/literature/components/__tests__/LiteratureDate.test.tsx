import React from 'react';
import { shallow } from 'enzyme';

import LiteratureDate from '../LiteratureDate';

<<<<<<< Updated upstream

describe('LiteratureDate', () => {
  
  it('renders with date', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<LiteratureDate date="1993-06-07" />);
    
=======
describe('LiteratureDate', () => {
  it('renders with date', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<LiteratureDate date="1993-06-07" />);
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
