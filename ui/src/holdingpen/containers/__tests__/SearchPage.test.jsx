import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { getStore } from '../../../fixtures/store';
import { SEARCHING } from '../../../actions/actionTypes';
import SearchPage from '../SearchPage';

describe('SearchPage', () => {
  it('dispatches search', () => {
    const store = getStore();
    mount((
      <Provider store={store}>
        <SearchPage />
      </Provider>
    ));
    const actions = store.getActions();
    expect(actions.some(action => action.type === SEARCHING)).toBe(true);
  });
});
