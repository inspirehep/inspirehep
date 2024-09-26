import React from 'react';
import { shallow } from 'enzyme';

import HeaderMenu from '../HeaderMenu';

describe('HeaderMenu', () => {
  it('renders when logged in', () => {
    const wrapper = shallow(<HeaderMenu loggedIn onLogoutClick={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when not logged in', () => {
    const wrapper = shallow(
      <HeaderMenu loggedIn={false} onLogoutClick={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
