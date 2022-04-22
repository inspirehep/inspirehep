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
});
