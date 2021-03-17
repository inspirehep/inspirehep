import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../fixtures/store';
import SearchPageContainer, { SearchPage } from '../SearchPageContainer';
import ToolActionContainer from '../ToolActionContainer';

describe('SearchPageContainer Container', () => {
  it('set assignView true if cataloger is logged in and flag is enabled', () => {
    // TODO: Remove line when the flag is not needed anymore
    global.CONFIG = { ASSIGN_CONFERENCE_UI_FEATURE_FLAG: true };
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(SearchPage)).toHaveProp({
      assignView: true,
    });

    expect(wrapper.find(ToolActionContainer)).toExist();
  });

  // TODO: Remove test case when the flag is not needed anymore
  it('set assignView false if cataloger is logged in and flag is disabled', () => {
    global.CONFIG = { ASSIGN_CONFERENCE_UI_FEATURE_FLAG: false };
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(SearchPage)).toHaveProp({
      assignView: false,
    });
    expect(wrapper.find(ToolActionContainer).exists()).toBe(false);
  });

  // TODO: Remove test case when the flag is not needed anymore
  it('set assignView true if superuser is logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/literature']} initialIndex={0}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find(SearchPage)).toHaveProp({
      assignView: true,
    });
    expect(wrapper.find(ToolActionContainer)).toExist();
  });
});
