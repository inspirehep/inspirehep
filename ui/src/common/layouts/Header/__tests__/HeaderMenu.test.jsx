import React from 'react';
import { shallow } from 'enzyme';
import { Set } from 'immutable';

import HeaderMenu from '../HeaderMenu';
import LinkLikeButton from '../../../components/LinkLikeButton';

describe('HeaderMenu', () => {
  it('does not show some tool links if logged in user is not superuser nor cataloger', () => {
    const wrapper = shallow(
      <HeaderMenu
        loggedIn
        userRoles={Set(['betauser'])}
        onLogoutClick={jest.fn()}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('shows all tool links if logged in user is cataloger', () => {
    const wrapper = shallow(
      <HeaderMenu
        loggedIn
        userRoles={Set(['cataloger'])}
        onLogoutClick={jest.fn()}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('displays Login link instead of My Account if user is not logged in', () => {
    const wrapper = shallow(
      <HeaderMenu
        loggedIn={false}
        userRoles={Set()}
        onLogoutClick={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onLogoutClick on logout button click', () => {
    const onLogoutClick = jest.fn();
    const wrapper = shallow(
      <HeaderMenu
        loggedIn
        userRoles={Set(['betauser'])}
        onLogoutClick={onLogoutClick}
      />
    );
    wrapper.find(LinkLikeButton).simulate('click');
    expect(onLogoutClick).toHaveBeenCalled();
  });
});
