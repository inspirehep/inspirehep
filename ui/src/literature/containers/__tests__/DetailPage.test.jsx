import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import { getStore } from '../../../fixtures/store';
import { LITERATURE_REQUEST } from '../../../actions/actionTypes';
import DetailPage from '../DetailPage';

const matchProps = {
  params: {
    id: 123,
  },
};

describe('Literature - DetailPage', () => {
  it('dispatches fetch literature record', () => {
    const store = getStore();
    mount((
      <Provider store={store}>
        <DetailPage match={matchProps} />
      </Provider>
    ));
    const actions = store.getActions();
    expect(actions.some(action => action.type === LITERATURE_REQUEST)).toBe(true);
  });
});
