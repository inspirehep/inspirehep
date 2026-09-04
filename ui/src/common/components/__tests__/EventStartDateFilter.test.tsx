import { render } from '@testing-library/react';
import { advanceTo, clear } from 'jest-date-mock';
import userEvent from '@testing-library/user-event';
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
    const screen = render(
      <EventStartDateFilter
        selection={START_DATE_ALL}
        onChange={vi.fn()}
        switchTitle="Upcoming items"
      />
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByTestId('start-date-picker')).toHaveValue('');
    expect(screen.getByTestId('end-date-picker')).toHaveValue('');
  });

  it('renders with selection: upcoming', () => {
    const screen = render(
      <EventStartDateFilter
        selection={START_DATE_UPCOMING}
        onChange={vi.fn()}
        switchTitle="Upcoming items"
      />
    );
    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByTestId('start-date-picker')).toHaveValue('');
    expect(screen.getByTestId('end-date-picker')).toHaveValue('');
  });

  it('renders with selection: a date range', () => {
    const startDate = '2019-05-05';
    const endDate = '2020-01-01';
    const screen = render(
      <EventStartDateFilter
        selection={`${startDate}${SEPARATOR}${endDate}`}
        onChange={vi.fn()}
        switchTitle="Upcoming items"
      />
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByTestId('start-date-picker')).toHaveValue(startDate);
    expect(screen.getByTestId('end-date-picker')).toHaveValue(endDate);
  });

  it('renders without selection', () => {
    const screen = render(
      <EventStartDateFilter onChange={vi.fn()} switchTitle="Upcoming items" />
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByTestId('start-date-picker')).toHaveValue('');
    expect(screen.getByTestId('end-date-picker')).toHaveValue('');
  });

  it('calls onChange with "all" when date range filter is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
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
    await user.click(closeIcons[0].parentElement!);

    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  it('calls onChange with range on date range filter change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const currentDate = new Date('2019-05-05T13:31:00+00:00');
    advanceTo(currentDate);

    const screen = render(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    await user.click(screen.getByTestId('start-date-picker'));
    await user.click(screen.getByTitle('2019-05-05'));

    const range = `2019-05-05${SEPARATOR}`;

    expect(onChange).toHaveBeenCalledWith(range);
  });

  it('calls onChange with "upcoming" if switch is checked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const screen = render(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(START_DATE_UPCOMING);
  });

  it('calls onChange with "all" if switch is unchecked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const screen = render(
      <EventStartDateFilter
        onChange={onChange}
        switchTitle="Upcoming items"
        selection={START_DATE_UPCOMING}
      />
    );

    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  it('passes switch to false when a date range is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const currentDate = new Date('2019-05-05T13:31:00+00:00');
    advanceTo(currentDate);
    const screen = render(
      <EventStartDateFilter
        selection={START_DATE_UPCOMING}
        onChange={onChange}
        switchTitle="Upcoming items"
      />
    );
    expect(screen.getByRole('switch')).toBeChecked();

    await user.click(screen.getByTestId('start-date-picker'));
    await user.click(screen.getByTitle('2019-05-05'));

    const range = `2019-05-05${SEPARATOR}`;
    expect(onChange).toHaveBeenCalledWith(range);
  });

  it('calls onChange without date range when switch is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const screen = render(
      <EventStartDateFilter
        selection="2019-05-05--"
        onChange={onChange}
        switchTitle="Upcoming items"
      />
    );

    const switchUpcoming = screen.getByRole('switch');
    const startDatePicker = screen.getByTestId('start-date-picker');

    expect(startDatePicker).toHaveValue('2019-05-05');

    await user.click(switchUpcoming);

    expect(onChange).toHaveBeenCalledWith(START_DATE_UPCOMING);
  });
});
