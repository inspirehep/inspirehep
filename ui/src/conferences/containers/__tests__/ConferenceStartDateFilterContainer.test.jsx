import React from 'react';
import { fromJS } from 'immutable';

import { getStore, mockActionCreator } from '../../../fixtures/store';
import { CONFERENCES_NS } from '../../../search/constants';
import ConferenceStartDateFilterContainer from '../ConferenceStartDateFilterContainer';
import { START_DATE_ALL, START_DATE_UPCOMING } from '../../../common/constants';
import { renderWithProviders } from '../../../fixtures/render';
import { searchQueryUpdate } from '../../../actions/search';

global.AnimationEvent =
  global.AnimationEvent ||
  class AnimationEvent extends Event {
    // Empty constructor for test mocking
  };

jest.mock('../../../common/components/EventStartDateFilter', () => (props) => {
  global.eventStartDateFilterOnChange = props.onChange;
  return (
    <div data-testid="event-start-date-filter">
      <div role="switch" aria-checked={props.selection === 'upcoming'} />
    </div>
  );
});

jest.mock('../../../common/components/DateRangeFilter', () => (props) => {
  global.dateRangeFilterOnChange = props.onChange;
  return <div data-testid="mock-date-range-filter" />;
});

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('ConferenceStartDateFilterContainer', () => {
  beforeEach(() => {
    global.eventStartDateFilterOnChange = undefined;
    global.dateRangeFilterOnChange = undefined;
  });

  it('passes conference search query start_date', () => {
    const store = getStore({
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
    const { getByRole } = renderWithProviders(
      <ConferenceStartDateFilterContainer switchTitle="title" />,
      { store }
    );
    const switchEl = getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');
  });

  it('dispatches SEARCH_QUERY_UPDATE onChange with start_date and sort=datedesc if all', () => {
    const store = getStore();
    renderWithProviders(
      <ConferenceStartDateFilterContainer switchTitle="title" />,
      { store }
    );

    if (typeof global.eventStartDateFilterOnChange === 'function') {
      global.eventStartDateFilterOnChange(START_DATE_ALL);
    }

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
    renderWithProviders(
      <ConferenceStartDateFilterContainer switchTitle="title" />,
      { store }
    );

    if (typeof global.eventStartDateFilterOnChange === 'function') {
      global.eventStartDateFilterOnChange(START_DATE_UPCOMING);
    }

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
    renderWithProviders(
      <ConferenceStartDateFilterContainer switchTitle="title" />,
      { store }
    );

    if (typeof global.eventStartDateFilterOnChange === 'function') {
      global.eventStartDateFilterOnChange('2020-02-13--');
    }
    const expectedActions = [
      searchQueryUpdate(CONFERENCES_NS, {
        start_date: '2020-02-13--',
        page: '1',
      }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
