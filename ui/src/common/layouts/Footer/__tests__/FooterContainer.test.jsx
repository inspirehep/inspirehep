import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../../fixtures/store';
import FooterContainer from '../FooterContainer';
import Footer from '../Footer';

describe('FooterContainer', () => {
  it('passes props from state when cataloger', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <FooterContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Footer)).toHaveProp({
      isCatalogerLoggedIn: true,
    });
  });

  it('passes props from state when not cataloger', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['not-cataloger'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <FooterContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(Footer)).toHaveProp({
      isCatalogerLoggedIn: false,
    });
  });
});
