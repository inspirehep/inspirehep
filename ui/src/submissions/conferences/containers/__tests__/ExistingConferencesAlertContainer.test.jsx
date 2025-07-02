import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import ExistingConferencesAlertContainer from '../ExistingConferencesAlertContainer';
import { EXISTING_CONFERENCES_NS } from '../../../../search/constants';
import { SEARCH_QUERY_UPDATE } from '../../../../actions/actionTypes';
import { getStore } from '../../../../fixtures/store';
import { RANGE_AGGREGATION_SELECTION_SEPARATOR } from '../../../../common/constants';

describe('ExistingConferencesAlertContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE initially', () => {
    const startingDate = '2020-01-24';
    const closingDate = '2020-09-20';
    const store = getStore();
    const namespace = EXISTING_CONFERENCES_NS;

    render(
      <Provider store={store}>
        <ExistingConferencesAlertContainer
          dates={[startingDate, closingDate]}
        />
      </Provider>
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

    render(
      <Provider store={store}>
        <ExistingConferencesAlertContainer
          dates={[startingDate, closingDate]}
        />
      </Provider>
    );

    expect(
      screen.getByTestId('conferences-exist-alert-number')
    ).toHaveTextContent('5');
  });
});
