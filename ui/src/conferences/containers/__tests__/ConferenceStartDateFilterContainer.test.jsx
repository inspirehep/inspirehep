import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { CONFERENCES_NS } from '../../../reducers/search';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';
import ConferenceStartDateFilterContainer from '../ConferenceStartDateFilterContainer';
import ConferenceStartDateFilter from '../../components/ConferenceStartDateFilter';

describe('ConferenceStartDateFilterContainer', () => {
  it('passes conference search query start_date', () => {
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [CONFERENCES_NS]: {
            query: {
              start_date: 'all',
            },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer />
      </Provider>
    );

    expect(wrapper.find(ConferenceStartDateFilter)).toHaveProp({
      selection: 'all',
    });
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer />
      </Provider>
    );
    const onChange = wrapper.find(ConferenceStartDateFilter).prop('onChange');
    onChange('all');
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: {
          namespace: CONFERENCES_NS,
          query: { start_date: 'all', page: '1' },
        },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
