import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { getStore } from '../../../fixtures/store';
import { SEARCH_REQUEST } from '../../../actions/actionTypes';
import SearchPage from '../SearchPage';

describe('Literature - SearchPage', () => {
  it('dispatches search', () => {
    const store = getStore();
    mount(
      <Provider store={store}>
        <SearchPage />
      </Provider>
    );
    const actions = store.getActions();
    const expectedAction = actions.find(
      action => action.type === SEARCH_REQUEST
    );
    expect(expectedAction).toBeDefined();
    expect(expectedAction.payload).toBeUndefined();
  });
});
