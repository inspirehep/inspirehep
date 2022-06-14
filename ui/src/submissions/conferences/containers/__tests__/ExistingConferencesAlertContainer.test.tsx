import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import ExistingConferencesAlertContainer from '../ExistingConferencesAlertContainer';
import { EXISTING_CONFERENCES_NS } from '../../../../search/constants';
import { SEARCH_QUERY_UPDATE } from '../../../../actions/actionTypes';
import { getStore, getStoreWithState } from '../../../../fixtures/store';
import { RANGE_AGGREGATION_SELECTION_SEPARATOR } from '../../../../common/constants';
import ExistingConferencesAlert from '../../components/ExistingConferencesAlert';

describe('ExistingConferencesAlertContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE initially', () => {
    const startingDate = '2020-01-24';
    const closingDate = '2020-09-20';
    const store = getStore();
    const namespace = EXISTING_CONFERENCES_NS;
    mount(
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

  it('dispatches SEARCH_QUERY_UPDATE onDatesChange', () => {
    const initialStartingDate = '2020-01-24';
    const initialClosingDate = '2020-09-20';
    const store = getStore();
    const namespace = EXISTING_CONFERENCES_NS;
    const wrapper = mount(
      <Provider store={store}>
        <ExistingConferencesAlertContainer
          dates={[initialStartingDate, initialClosingDate]}
        />
      </Provider>
    );
    store.clearActions();

    const newStartingDate = '2021-05-14';
    const newClosingDate = '2021-07-11';
    const onDatesChange = wrapper
      .find(ExistingConferencesAlert)
      .prop('onDatesChange');
    onDatesChange([newStartingDate, newClosingDate]);

    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: {
          namespace,
          query: {
            contains: `${newStartingDate}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${newClosingDate}`,
          },
        },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('passes numberOfConferences', () => {
    const startingDate = '2020-01-24';
    const closingDate = '2020-09-20';
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [EXISTING_CONFERENCES_NS]: {
            total: 5,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <ExistingConferencesAlertContainer
          dates={[startingDate, closingDate]}
        />
      </Provider>
    );
    expect(wrapper.find(ExistingConferencesAlert)).toHaveProp({
      numberOfConferences: 5,
    });
  });
});
