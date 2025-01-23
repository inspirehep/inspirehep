import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import { fromJS } from 'immutable';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore, mockActionCreator } from '../../../fixtures/store';
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
    const namespace = SEMINARS_NS;
    const store = getStore({
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
    const { getByTestId } = render(
      <Provider store={store}>
        <SeminarStartDateFilterContainer
          namespace={namespace}
          switchTitle="title"
        />
      </Provider>
    );

    const childButton = within(
      getByTestId('event-start-date-filter')
    ).getByRole('switch');
    expect(childButton).toHaveAttribute('aria-checked', 'false');
  });

  it('passes seminar search query start_date upcoming', () => {
    const namespace = SEMINARS_NS;
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: {
              start_date: constants.START_DATE_UPCOMING,
            },
          },
        },
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <SeminarStartDateFilterContainer
          namespace={namespace}
          switchTitle="title"
        />
      </Provider>
    );

    const childButton = within(
      getByTestId('event-start-date-filter')
    ).getByRole('switch');
    expect(childButton).toHaveAttribute('aria-checked', 'true');
  });

  it('flips button to all and then to upcoming', () => {
    const store = getStore();
    const namespace = SEMINARS_NS;
    const { getByTestId } = render(
      <Provider store={store}>
        <SeminarStartDateFilterContainer
          namespace={namespace}
          switchTitle="title"
        />
      </Provider>
    );

    const queryAll = {
      start_date: constants.START_DATE_ALL,
      page: '1',
      sort: 'datedesc',
      timezone: undefined,
    };
    const queryUpcoming = {
      start_date: constants.START_DATE_UPCOMING,
      page: '1',
      sort: 'dateasc',
      timezone: undefined,
    };
    const expectedActions = [
      searchQueryUpdate(namespace, queryAll),
      searchQueryUpdate(namespace, queryUpcoming),
    ];

    const childButton = within(
      getByTestId('event-start-date-filter')
    ).getByRole('switch');
    // switch starts off on the upcoming state, first click sets it to all
    fireEvent.click(childButton);
    fireEvent.animationEnd(childButton);
    fireEvent.click(childButton);
    fireEvent.animationEnd(childButton);
    expect(store.getActions()).toEqual(expectedActions);
  });

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
    expect(store.getActions()).toEqual(expectedActions);
  });
});
