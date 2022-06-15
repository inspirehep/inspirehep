import React from 'react';
import { shallow } from 'enzyme';

import HeaderMenu from '../HeaderMenu';
import LinkLikeButton from '../../../components/LinkLikeButton';


describe('HeaderMenu', () => {
  
  it('renders when logged in', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<HeaderMenu loggedIn onLogoutClick={jest.fn()} />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders when not logged in', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <HeaderMenu loggedIn={false} onLogoutClick={jest.fn()} />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onLogoutClick on logout button click', () => {
    
    const onLogoutClick = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <HeaderMenu loggedIn onLogoutClick={onLogoutClick} />
    );
    wrapper.find(LinkLikeButton).simulate('click');
    
    expect(onLogoutClick).toHaveBeenCalled();
  });
});
