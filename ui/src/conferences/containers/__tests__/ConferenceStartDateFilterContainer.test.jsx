import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import { CONFERENCES_NS } from '../../../reducers/search';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';
import ConferenceStartDateFilterContainer from '../ConferenceStartDateFilterContainer';
import ConferenceStartDateFilter from '../../components/ConferenceStartDateFilter';
import { START_DATE_ALL, START_DATE_UPCOMING } from '../../../common/constants';

describe('ConferenceStartDateFilterContainer', () => {
  it('passes conference search query start_date', () => {
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [CONFERENCES_NS]: {
            query: {
              start_date: START_DATE_ALL,
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
      selection: START_DATE_ALL,
    });
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=datedesc if all', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer />
      </Provider>
    );
    const onChange = wrapper.find(ConferenceStartDateFilter).prop('onChange');
    onChange(START_DATE_ALL);
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: {
          namespace: CONFERENCES_NS,
          query: { start_date: START_DATE_ALL, page: '1', sort: 'datedesc' },
        },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=dateasc if upcoming', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer />
      </Provider>
    );
    const onChange = wrapper.find(ConferenceStartDateFilter).prop('onChange');
    onChange(START_DATE_UPCOMING);
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: {
          namespace: CONFERENCES_NS,
          query: {
            start_date: START_DATE_UPCOMING,
            page: '1',
            sort: 'dateasc',
          },
        },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date without if specific date', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer />
      </Provider>
    );
    const onChange = wrapper.find(ConferenceStartDateFilter).prop('onChange');
    onChange('2020-02-13--');
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: {
          namespace: CONFERENCES_NS,
          query: { start_date: '2020-02-13--', page: '1' },
        },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
