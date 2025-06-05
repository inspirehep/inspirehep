import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { advanceTo, clear } from 'jest-date-mock';

import DateRangeFilter from '../DateRangeFilter';

describe('DateRangeFilter', () => {
  afterEach(() => {
    clear();
  });

  it('renders DateRangeFilter with all props set', () => {
    const { asFragment } = render(
      <DateRangeFilter onChange={jest.fn()} range="2019-11-21--2019-11-22" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders DateRangeFilter without range', () => {
    const { asFragment } = render(<DateRangeFilter onChange={jest.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onChange when start date selected and no range', async () => {
    const onChange = jest.fn();

    const currentDate = new Date('2019-05-28T13:31:00+00:00');
    advanceTo(currentDate);

    const screen = render(<DateRangeFilter onChange={onChange} range="" />);

    fireEvent.click(screen.getByTestId('start-date-picker'));
    fireEvent.click(screen.getByTitle('2019-05-28'));

    expect(onChange).toHaveBeenCalledWith('2019-05-28--');
  });

  it('calls onChange when start date selected and there is range', () => {
    const onChange = jest.fn();

    const currentDate = new Date('2019-05-28T13:31:00+00:00');
    advanceTo(currentDate);

    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-11-21--2019-11-23" />
    );

    fireEvent.click(screen.getByTestId('start-date-picker'));
    fireEvent.click(screen.getByTitle('2019-11-22'));

    expect(onChange).toHaveBeenCalledWith('2019-11-22--2019-11-23');
  });

  it('calls onChange when end date selected and there is range', () => {
    const onChange = jest.fn();

    const currentDate = new Date('2019-05-28T13:31:00+00:00');
    advanceTo(currentDate);

    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-11-21--2019-11-23" />
    );

    fireEvent.click(screen.getByTestId('end-date-picker'));
    fireEvent.click(screen.getByTitle('2019-11-22'));

    expect(onChange).toHaveBeenCalledWith('2019-11-21--2019-11-22');
  });

  it('calls onChange when end date selected and no range', () => {
    const onChange = jest.fn();
    const currentDate = new Date('2019-05-28T13:31:00+00:00');
    advanceTo(currentDate);

    const screen = render(<DateRangeFilter onChange={onChange} range="" />);
    fireEvent.click(screen.getByTestId('end-date-picker'));
    fireEvent.click(screen.getByTitle('2019-05-28'));

    expect(onChange).toHaveBeenCalledWith('--2019-05-28');
  });

  it('calls onChange with cleared start date when start date is removed and there are range', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-04-21--2019-11-22" />
    );

    const closeIcon = screen.getAllByRole('img', { name: 'close-circle' })[0]
      .parentElement;
    fireEvent.mouseUp(closeIcon);

    expect(onChange).toHaveBeenCalledWith('--2019-11-22');
  });

  it('calls onChange with cleared end date when end date is removed and there are range', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-04-21--2019-11-22" />
    );

    const closeIcon = screen.getAllByRole('img', { name: 'close-circle' })[1]
      .parentElement;
    fireEvent.mouseUp(closeIcon);

    expect(onChange).toHaveBeenCalledWith('2019-04-21--');
  });

  it('sets start date disabled when end date before given date', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-11-21--2019-11-22" />
    );

    fireEvent.click(screen.getByTestId('start-date-picker'));
    expect(screen.getByTitle('2019-11-23')).toHaveClass(
      'ant-picker-cell-disabled'
    );
  });

  it('does not set start date disabled when end date is later than given date', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-11-21--2019-11-22" />
    );

    fireEvent.click(screen.getByTestId('start-date-picker'));
    expect(screen.getByTitle('2019-11-19')).not.toHaveClass(
      'ant-picker-cell-disabled'
    );
  });

  it('sets end date disabled when start date after given date', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-11-22--2019-11-21" />
    );

    fireEvent.click(screen.getByTestId('start-date-picker'));

    expect(screen.getAllByTitle('2019-11-21')[1]).toHaveClass(
      'ant-picker-cell-disabled'
    );
  });

  it('does not set end date disabled when start date is before than given date', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-11-22--" />
    );

    fireEvent.click(screen.getByTestId('start-date-picker'));

    expect(screen.getByTitle('2019-11-29')).not.toHaveClass(
      'ant-picker-cell-disabled'
    );
  });

  it('does not set start date disabled when there is no end date', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="2019-11-22--" />
    );

    fireEvent.click(screen.getByTestId('start-date-picker'));

    expect(screen.getAllByTitle('2019-11-22')[1]).not.toHaveClass(
      'ant-picker-cell-disabled'
    );
  });

  it('does not set end date disabled when there is no start date', () => {
    const onChange = jest.fn();
    const screen = render(
      <DateRangeFilter onChange={onChange} range="--2019-11-22" />
    );

    fireEvent.click(screen.getByTestId('end-date-picker'));

    expect(screen.getAllByTitle('2019-11-22')[1]).not.toHaveClass(
      'ant-picker-cell-disabled'
    );
  });
});
