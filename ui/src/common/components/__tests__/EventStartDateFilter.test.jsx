import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { advanceTo, clear } from 'jest-date-mock';

import {
  START_DATE_ALL,
  START_DATE_UPCOMING,
  RANGE_AGGREGATION_SELECTION_SEPARATOR as SEPARATOR,
} from '../../constants';
import EventStartDateFilter from '../EventStartDateFilter';

describe('EventStartDateFilter', () => {
  afterEach(() => {
    clear();
  });

  it('renders with selection: all', () => {
    const { asFragment } = render(
      <EventStartDateFilter
        selection={START_DATE_ALL}
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with selection: upcoming', () => {
    const { asFragment } = render(
      <EventStartDateFilter
        selection={START_DATE_UPCOMING}
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with selection: a date range', () => {
    const { asFragment } = render(
      <EventStartDateFilter
        selection={`2019-05-05${SEPARATOR}2020-01-01`}
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders without selection', () => {
    const { asFragment } = render(
      <EventStartDateFilter onChange={jest.fn()} switchTitle="Upcoming items" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onChange with "all" when date range filter is cleared', () => {
    const onChange = jest.fn();
    const currentDate = new Date('2019-05-05T13:31:00+00:00');
    advanceTo(currentDate);

    const screen = render(
      <EventStartDateFilter
        selection="2019-05-05--"
        onChange={onChange}
        switchTitle="Upcoming items"
      />
    );

    const closeIcons = screen.getAllByRole('img', { name: 'close-circle' });
    fireEvent.mouseUp(closeIcons[0].parentElement);

    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  it('calls onChange with range on date range filter change', () => {
    const onChange = jest.fn();
    const currentDate = new Date('2019-05-05T13:31:00+00:00');
    advanceTo(currentDate);

    const screen = render(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    fireEvent.click(screen.getByTestId('start-date-picker'));
    fireEvent.click(screen.getByTitle('2019-05-05'));

    const range = `2019-05-05${SEPARATOR}`;

    expect(onChange).toHaveBeenCalledWith(range);
  });

  it('calls onChange with "upcoming", after animation if switch is checked', () => {
    const onChange = jest.fn();
    const screen = render(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    fireEvent.click(screen.getByRole('switch'));
    fireEvent.animationEnd(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(START_DATE_UPCOMING);
  });

  it('calls onChange with "all", after animation if switch is unchecked', () => {
    const onChange = jest.fn();
    const screen = render(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    fireEvent.click(screen.getByRole('switch'));
    fireEvent.animationEnd(screen.getByRole('switch'));

    fireEvent.click(screen.getByRole('switch'));
    fireEvent.animationEnd(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  it('calls onChange once on each switch change even if onAnimationEnd triggered multiple times', () => {
    const onChange = jest.fn();
    const screen = render(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    fireEvent.click(screen.getByRole('switch'));
    fireEvent.animationEnd(screen.getByRole('switch'));
    fireEvent.animationEnd(screen.getByRole('switch'));
    fireEvent.animationEnd(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
