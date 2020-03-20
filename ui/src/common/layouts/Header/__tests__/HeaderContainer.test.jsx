import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../../fixtures/store';
import HeaderContainer from '../HeaderContainer';
import { SUBMISSIONS, HOME } from '../../../routes';
import Header from '../Header';

describe('HeaderContainer', () => {
  it('passes props from state when submissions page', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: `${SUBMISSIONS}/page`,
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <HeaderContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Header)).toHaveProp({
      isHomePage: false,
      isSubmissionsPage: true,
      isBetaPage: false,
    });
  });

  it('passes props from state when home page', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: `${HOME}`,
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <HeaderContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Header)).toHaveProp({
      isHomePage: true,
      isSubmissionsPage: false,
      isBetaPage: false,
    });
  });
});
