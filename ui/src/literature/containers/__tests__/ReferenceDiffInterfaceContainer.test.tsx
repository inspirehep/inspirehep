import React from 'react';
import { fromJS } from 'immutable';

import ReferenceDiffInterfaceContainer from '../ReferenceDiffInterfaceContainer';
import { getStore } from '../../../fixtures/store';
import { renderWithProviders } from '../../../fixtures/render';
import { initialState } from '../../../reducers/literature';

describe('ReferenceDiffInterfaceContainer', () => {
  it('dispatches fetchLiterature, fetchLiteratureAuthors and fetchReferencesDiff on load', () => {
    const store = getStore({
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

    renderWithProviders(<ReferenceDiffInterfaceContainer />, { store });
    expect(JSON.stringify(store.getActions())).toContain('LITERATURE_REQUEST');
    expect(JSON.stringify(store.getActions())).toContain(
      'LITERATURE_AUTHORS_REQUEST'
    );
    expect(JSON.stringify(store.getActions())).toContain(
      'REFERENCES_DIFF_REQUEST'
    );
  });
});
