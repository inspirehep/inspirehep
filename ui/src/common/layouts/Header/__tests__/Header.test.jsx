import React from 'react';
import { shallow } from 'enzyme';

import Header from '../Header';

describe('Header', () => {
  it('renders with search box if it is not on home or submission', () => {
    const wrapper = shallow(
      <Header isSubmissionsPage={false} isHomePage={false} isBetaPage={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without search box if it is on homepage `/`', () => {
    const wrapper = shallow(<Header isSubmissionsPage={false} isHomePage isBetaPage={false}/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without search box if it is on submission page', () => {
    const wrapper = shallow(<Header isSubmissionsPage isHomePage={false} isBetaPage={false}/>);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with Banner and Ribbon if it is on beta page', () => {
    const wrapper = shallow(<Header isSubmissionsPage={false} isHomePage={false} isBetaPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
