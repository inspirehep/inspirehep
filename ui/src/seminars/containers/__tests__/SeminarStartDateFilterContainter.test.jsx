import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import {
  getStoreWithState,
  getStore,
  mockActionCreator,
} from '../../../fixtures/store';
import { SEMINARS_NS } from '../../../search/constants';
import * as constants from '../../../common/constants';
import SeminarStartDateFilterContainer from '../SeminarStartDateFilterContainer';
import EventStartDateFilter from '../../../common/components/EventStartDateFilter';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('SeminarStartDateFilterContainer', () => {
  constants.LOCAL_TIMEZONE = 'Europe/Zurich';

  it('passes seminar search query start_date', () => {
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [SEMINARS_NS]: {
            query: {
              start_date: constants.START_DATE_ALL,
            },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer switchTitle="title" />
      </Provider>
    );

    expect(wrapper.find(EventStartDateFilter)).toHaveProp({
      selection: constants.START_DATE_ALL,
    });
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=datedesc and empties timezone if all', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer switchTitle="title" />
      </Provider>
    );
    const onChange = wrapper.find(EventStartDateFilter).prop('onChange');
    onChange(constants.START_DATE_ALL);

    const query = {
      start_date: constants.START_DATE_ALL,
      page: '1',
      sort: 'datedesc',
      timezone: undefined,
    };
    const expectedActions = [searchQueryUpdate(SEMINARS_NS, query)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=dateasc and empties timezone if upcoming', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer switchTitle="title" />
      </Provider>
    );
    const onChange = wrapper.find(EventStartDateFilter).prop('onChange');
    onChange(constants.START_DATE_UPCOMING);

    const query = {
      start_date: constants.START_DATE_UPCOMING,
      page: '1',
      sort: 'dateasc',
      timezone: undefined,
    };
    const expectedActions = [searchQueryUpdate(SEMINARS_NS, query)];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and timezone if specific date', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer switchTitle="title" />
      </Provider>
    );
    const onChange = wrapper.find(EventStartDateFilter).prop('onChange');
    onChange('2020-02-13--');

    const query = {
      start_date: '2020-02-13--',
      page: '1',
      timezone: 'Europe/Zurich',
    };
    const expectedActions = [searchQueryUpdate(SEMINARS_NS, query)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
