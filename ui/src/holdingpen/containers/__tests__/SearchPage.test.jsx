import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';

import { getStore } from '../../../fixtures/store';
import { SEARCHING } from '../../../actions/actionTypes';
import SearchPage from '../SearchPage';

describe('SearchPage', () => {
  it('renders initial state', () => {
    const component = shallow((
      <Provider store={getStore()}>
        <SearchPage />
      </Provider>
    ));
    expect(component).toMatchSnapshot();
  });

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
