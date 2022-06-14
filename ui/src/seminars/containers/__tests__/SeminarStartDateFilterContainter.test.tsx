import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import {
  getStoreWithState,
  getStore,
  mockActionCreator,
} from '../../../fixtures/store';
import { SEMINARS_NS, AUTHOR_SEMINARS_NS } from '../../../search/constants';
import * as constants from '../../../common/constants';
import SeminarStartDateFilterContainer from '../SeminarStartDateFilterContainer';
import EventStartDateFilter from '../../../common/components/EventStartDateFilter';
import { searchQueryUpdate } from '../../../actions/search';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SeminarStartDateFilterContainer', () => {
  // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'LOCAL_TIMEZONE' because it is a ... Remove this comment to see the full error message
  constants.LOCAL_TIMEZONE = 'Europe/Zurich';

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes seminar search query start_date', () => {
    const namespace = SEMINARS_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: {
              start_date: constants.START_DATE_ALL,
            },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer
          namespace={namespace}
          switchTitle="title"
        />
      </Provider>
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(EventStartDateFilter)).toHaveProp({
      selection: constants.START_DATE_ALL,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=datedesc and empties timezone if all', () => {
    const store = getStore();
    const namespace = SEMINARS_NS;
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer
          namespace={namespace}
          switchTitle="title"
        />
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
    const expectedActions = [searchQueryUpdate(namespace, query)];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=dateasc and empties timezone if upcoming', () => {
    const store = getStore();
    const namespace = AUTHOR_SEMINARS_NS;
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer
          namespace={namespace}
          switchTitle="title"
        />
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
    const expectedActions = [searchQueryUpdate(namespace, query)];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and timezone if specific date', () => {
    const store = getStore();
    const namespace = SEMINARS_NS;
    const wrapper = mount(
      <Provider store={store}>
        <SeminarStartDateFilterContainer
          namespace={namespace}
          switchTitle="title"
        />
      </Provider>
    );
    const onChange = wrapper.find(EventStartDateFilter).prop('onChange');
    onChange('2020-02-13--');

    const query = {
      start_date: '2020-02-13--',
      page: '1',
      timezone: 'Europe/Zurich',
    };
    const expectedActions = [searchQueryUpdate(namespace, query)];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
