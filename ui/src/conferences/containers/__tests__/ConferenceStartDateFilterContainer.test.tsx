import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import {
  getStoreWithState,
  getStore,
  mockActionCreator,
} from '../../../fixtures/store';
import { CONFERENCES_NS } from '../../../search/constants';
import ConferenceStartDateFilterContainer from '../ConferenceStartDateFilterContainer';
import { START_DATE_ALL, START_DATE_UPCOMING } from '../../../common/constants';
import EventStartDateFilter from '../../../common/components/EventStartDateFilter';

import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

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
        <ConferenceStartDateFilterContainer switchTitle="title" />
      </Provider>
    );

    expect(wrapper.find(EventStartDateFilter)).toHaveProp({
      selection: START_DATE_ALL,
    });
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=datedesc if all', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer switchTitle="title" />
      </Provider>
    );
    const onChange = wrapper.find(EventStartDateFilter).prop('onChange');
    onChange(START_DATE_ALL);
    const expectedActions = [
      searchQueryUpdate(CONFERENCES_NS, {
        start_date: START_DATE_ALL,
        page: '1',
        sort: 'datedesc',
      }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=dateasc if upcoming', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer switchTitle="title" />
      </Provider>
    );
    const onChange = wrapper.find(EventStartDateFilter).prop('onChange');
    onChange(START_DATE_UPCOMING);
    const expectedActions = [
      searchQueryUpdate(CONFERENCES_NS, {
        start_date: START_DATE_UPCOMING,
        page: '1',
        sort: 'dateasc',
      }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date without if specific date', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ConferenceStartDateFilterContainer switchTitle="title" />
      </Provider>
    );
    const onChange = wrapper.find(EventStartDateFilter).prop('onChange');
    onChange('2020-02-13--');
    const expectedActions = [
      searchQueryUpdate(CONFERENCES_NS, {
        start_date: '2020-02-13--',
        page: '1',
      }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
