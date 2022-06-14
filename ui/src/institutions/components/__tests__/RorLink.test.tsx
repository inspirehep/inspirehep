import React from 'react';
import { shallow } from 'enzyme';
import RorLink from '../RorLink';

describe('RorLink', () => {
  it('renders', () => {
    const ror = 'https://ror123.org';
    const wrapper = shallow(<RorLink ror={ror} />);
    expect(wrapper).toMatchSnapshot();
  });
});
