import React from 'react';
import { shallow } from 'enzyme';

import Header from '../Header';

describe('Header', () => {
  it('renders with search box if it is not on home', () => {
    const wrapper = shallow(
      <Header isSubmissionsPage={false} isHomePage={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without search box if it is on homepage `/`', () => {
    const wrapper = shallow(<Header isSubmissionsPage={false} isHomePage />);
    expect(wrapper).toMatchSnapshot();
  });
});
