import React from 'react';
import { within } from '@testing-library/react';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../../fixtures/render';
import { getStore, mockActionCreator } from '../../../fixtures/store';
import { SEMINARS_NS } from '../../../search/constants';
import * as constants from '../../../common/constants';
import SeminarStartDateFilterContainer from '../SeminarStartDateFilterContainer';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../common/components/EventStartDateFilter', () => (props) => {
  global.seminarEventStartDateFilterOnChange = props.onChange;
  return (
    <div data-testid="event-start-date-filter">
      <div role="switch" aria-checked={props.selection === 'upcoming'} />
    </div>
  );
});

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('SeminarStartDateFilterContainer', () => {
  constants.LOCAL_TIMEZONE = 'Europe/Zurich';

  beforeEach(() => {
    global.seminarEventStartDateFilterOnChange = undefined;
  });

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
    const { getByTestId } = renderWithProviders(
      <SeminarStartDateFilterContainer
        namespace={namespace}
        switchTitle="title"
      />,
      { store }
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
    const { getByTestId } = renderWithProviders(
      <SeminarStartDateFilterContainer
        namespace={namespace}
        switchTitle="title"
      />,
      { store }
    );
    const childButton = within(
      getByTestId('event-start-date-filter')
    ).getByRole('switch');
    expect(childButton).toHaveAttribute('aria-checked', 'true');
  });

  it('flips button to all and then to upcoming', () => {
    const store = getStore();
    const namespace = SEMINARS_NS;
    renderWithProviders(
      <SeminarStartDateFilterContainer
        namespace={namespace}
        switchTitle="title"
      />,
      { store }
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

    if (typeof global.seminarEventStartDateFilterOnChange === 'function') {
      global.seminarEventStartDateFilterOnChange(constants.START_DATE_ALL);
      global.seminarEventStartDateFilterOnChange(constants.START_DATE_UPCOMING);
    }

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and timezone if specific date', () => {
    const store = getStore();
    const namespace = SEMINARS_NS;
    renderWithProviders(
      <SeminarStartDateFilterContainer
        namespace={namespace}
        switchTitle="title"
      />,
      { store }
    );

    if (typeof global.seminarEventStartDateFilterOnChange === 'function') {
      global.seminarEventStartDateFilterOnChange('2020-02-13--');
    }

    const query = {
      start_date: '2020-02-13--',
      page: '1',
      timezone: 'Europe/Zurich',
    };
    const expectedActions = [searchQueryUpdate(namespace, query)];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
