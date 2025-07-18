import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import EmbeddedSearchBoxContainer from '../EmbeddedSearchBoxContainer';
import { ASSIGN_AUTHOR_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('EmbeddedSearchBoxContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE on search', async () => {
    const store = getStore({
      user: {
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      },
    });
    const namespace = ASSIGN_AUTHOR_NS;

    const { getByRole } = renderWithProviders(
      <EmbeddedSearchBoxContainer namespace={ASSIGN_AUTHOR_NS} />,
      { store }
    );

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'test' },
    });
    fireEvent.keyDown(getByRole('textbox'), {
      key: 'Enter',
      code: 'Enter',
    });

    const expectedActions = [searchQueryUpdate(namespace, { q: 'test' })];
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toEqual(expect.arrayContaining(expectedActions));
    });
  });
});
