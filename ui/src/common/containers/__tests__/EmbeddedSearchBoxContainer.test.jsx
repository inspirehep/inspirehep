import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import EmbeddedSearchBoxContainer from '../EmbeddedSearchBoxContainer';
import { ASSIGN_AUTHOR_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('EmbeddedSearchBoxContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE on search', async () => {
    const store = getStore();
    const namespace = ASSIGN_AUTHOR_NS;

    const screen = render(
      <Provider store={store}>
        <EmbeddedSearchBoxContainer namespace={ASSIGN_AUTHOR_NS} />
      </Provider>
    );

    await waitFor(() =>
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test' },
      })
    );
    await waitFor(() =>
      fireEvent.keyDown(screen.getByRole('textbox'), {
        key: 'Enter',
        code: 'Enter',
      })
    );

    const q = 'test';

    const expectedActions = [searchQueryUpdate(namespace, { q })];
    await waitFor(() => expect(store.getActions()).toEqual(expectedActions));
  });
});
