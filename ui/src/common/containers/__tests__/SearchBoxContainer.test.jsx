import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../../fixtures/render';
import { getStore, mockActionCreator } from '../../../fixtures/store';
import SearchBoxContainer from '../SearchBoxContainer';
import { searchQueryUpdate } from '../../../actions/search';
import { appendQueryToLocationSearch } from '../../../actions/router';
import { UI_EXCLUDE_SELF_CITATIONS_PARAM } from '../../../literature/containers/ExcludeSelfCitationsContainer';
import { UI_CITATION_SUMMARY_PARAM } from '../../../literature/containers/CitationSummarySwitchContainer';
import { clearLiteratureSelection } from '../../../actions/literature';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);
jest.mock('../../../actions/literature');
mockActionCreator(clearLiteratureSelection);
jest.mock('../../../actions/router');
mockActionCreator(appendQueryToLocationSearch);

describe('SearchBoxContainer', () => {
  it('passes namespace query q param to SearchBox', () => {
    const searchBoxNamespace = 'literature';
    const store = getStore({
      search: fromJS({
        searchBoxNamespace,
        namespaces: {
          [searchBoxNamespace]: {
            query: { q: 'test' },
          },
        },
      }),
    });
    const screen = renderWithProviders(<SearchBoxContainer />, { store });

    expect(screen.getAllByRole('combobox')[1]).toHaveValue('test');
  });

  it('calls SEARCH_QUERY_UPDATE and LITERATURE_SELECTION_CLEAR on search', async () => {
    const searchBoxNamespace = 'literature';
    const store = getStore({
      search: fromJS({
        searchBoxNamespace,
      }),
    });

    renderWithProviders(<SearchBoxContainer />, { store });

    const search = document.querySelector('.ant-input-search-button');
    await fireEvent.click(search);

    const expectedActions = [
      clearLiteratureSelection(),
      searchQueryUpdate(searchBoxNamespace, { q: '' }),
    ];
    await waitFor(() => expect(store.getActions()).toEqual(expectedActions));
  });

  it('resets the ui query params on Search unless literature namespace', async () => {
    const newNamespace = 'authors';
    const store = getStore({
      search: fromJS({
        newNamespace,
      }),
    });

    renderWithProviders(<SearchBoxContainer />, { store });

    const search = document.querySelector('.ant-input-search-button');
    await fireEvent.click(search);

    const expectedAction = appendQueryToLocationSearch({
      [UI_CITATION_SUMMARY_PARAM]: undefined,
      [UI_EXCLUDE_SELF_CITATIONS_PARAM]: undefined,
    });
    await waitFor(() =>
      expect(store.getActions()).toContainEqual(expectedAction)
    );
  });
});
