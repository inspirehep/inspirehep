import React from 'react';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import ExistingConferencesAlertContainer from '../ExistingConferencesAlertContainer';
import { EXISTING_CONFERENCES_NS } from '../../../../search/constants';
import { SEARCH_QUERY_UPDATE } from '../../../../actions/actionTypes';
import { getStore } from '../../../../fixtures/store';
import { RANGE_AGGREGATION_SELECTION_SEPARATOR } from '../../../../common/constants';
import { renderWithProviders } from '../../../../fixtures/render';

describe('ExistingConferencesAlertContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE initially', () => {
    const startingDate = '2020-01-24';
    const closingDate = '2020-09-20';
    const store = getStore();
    const namespace = EXISTING_CONFERENCES_NS;

    renderWithProviders(
      <ExistingConferencesAlertContainer dates={[startingDate, closingDate]} />,
      { store }
    );

    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: {
          namespace,
          query: {
            contains: `${startingDate}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${closingDate}`,
          },
        },
      },
    ];

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('passes numberOfConferences', () => {
    const startingDate = '2020-01-24';
    const closingDate = '2020-09-20';
    const store = getStore({
      search: fromJS({
        namespaces: {
          [EXISTING_CONFERENCES_NS]: {
            total: 5,
          },
        },
      }),
    });

    renderWithProviders(
      <ExistingConferencesAlertContainer dates={[startingDate, closingDate]} />,
      { store }
    );

    expect(
      screen.getByTestId('conferences-exist-alert-number')
    ).toHaveTextContent('5');
  });
});
