import React from 'react';
import { shallow } from 'enzyme';
import HowToSearch from '../HowToSearch';

describe('HowToSearch', () => {
  it('renders the components', () => {
    const wrapper = shallow(
      <HowToSearch />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
