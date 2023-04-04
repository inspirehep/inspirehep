import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import ReferenceDiffInterfaceContainer from '../ReferenceDiffInterfaceContainer';
import { getStoreWithState } from '../../../fixtures/store';
import { initialState } from '../../../reducers/literature';

describe('ReferenceDiffInterfaceContainer', () => {
  it('dispatches fetchLiterature, fetchLiteratureAuthors and fetchReferencesDiff on load', () => {
    const store = getStoreWithState({
      literature: fromJS({
        ...initialState,
        data: {},
        authors: [],
        supervisors: [],
        referencesDiff: {
          previousVersion: {},
          currentVersion: {},
          referenceId: null,
        },
        errorReferencesDiff: null,
        loadingReferencesDiff: false,
      }),
      user: fromJS({
        loggedIn: true,
        data: {
          profile_control_number: '1234',
        },
      }),
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/literature/123/diff/1..2']}>
          <ReferenceDiffInterfaceContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(JSON.stringify(store.getActions())).toContain('LITERATURE_REQUEST');
    expect(JSON.stringify(store.getActions())).toContain(
      'LITERATURE_AUTHORS_REQUEST'
    );
    expect(JSON.stringify(store.getActions())).toContain(
      'REFERENCES_DIFF_REQUEST'
    );
  });
});
