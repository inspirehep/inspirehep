import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import { advanceTo, clear } from 'jest-date-mock';
import DateRangeFilter from '../DateRangeFilter';
import { DATE_RANGE_FORMAT } from '../../constants';

describe('DateRangeFilter', () => {
  afterEach(() => {
    clear();
  });

  it('renders DateRangeFilter with all props set', () => {
    const wrapper = shallow(
      <DateRangeFilter
        onChange={jest.fn()}
        range="2019-11-21--2019-11-22"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders DateRangeFilter without range', () => {
    const wrapper = shallow(
      <DateRangeFilter onChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onChange when start date selected and no range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const currentDate = advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const onStartDateChanged = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('onChange');
    onStartDateChanged(
      moment(currentDate),
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    expect(onChange).toHaveBeenCalledWith('2019-05-28--');
  });

  it('calls onChange when start date selected and there are range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="2019-11-21--2019-11-22"
      />
    );
    const currentDate = advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const onStartDateChanged = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('onChange');
    onStartDateChanged(
      moment(currentDate),
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    expect(onChange).toHaveBeenCalledWith('2019-05-28--2019-11-22');
  });

  it('calls onChange when end date selected and there are range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="2019-04-21--2019-11-22"
      />
    );
    const currentDate = advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const onStartDateChanged = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('onChange');
    onStartDateChanged(
      moment(currentDate),
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    expect(onChange).toHaveBeenCalledWith('2019-04-21--2019-05-28');
  });

  it('calls onChange when end date selected and no range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const currentDate = advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const onStartDateChanged = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('onChange');
    onStartDateChanged(
      moment(currentDate),
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    expect(onChange).toHaveBeenCalledWith('--2019-05-28');
  });

  it('calls onChange with cleared start date when start date is removed and there are range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="2019-04-21--2019-11-22"
      />
    );
    const onStartDateChanged = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('onChange');
    onStartDateChanged(null, '');
    expect(onChange).toHaveBeenCalledWith('--2019-11-22');
  });

  it('calls onChange with cleared start date when start date is removed and no range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const onStartDateChanged = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('onChange');
    onStartDateChanged(null, '');
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onChange with cleared end date when end date is removed and there are range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="2019-04-21--2019-11-22"
      />
    );
    const onStartDateChanged = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('onChange');
    onStartDateChanged(null, '');
    expect(onChange).toHaveBeenCalledWith('2019-04-21--');
  });

  it('calls onChange with cleared end date when end date is removed and no range', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const onStartDateChanged = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('onChange');
    onStartDateChanged(null, '');
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('sets start date disabled when end date before given date', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="--2019-11-22"
      />
    );
    const disabledDate = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('disabledDate');
    expect(disabledDate(moment(new Date('2019-11-28T13:31:00+00:00')))).toBe(
      true
    );
  });

  it('does not set start date disabled when end date is later than given date', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="--2019-11-22"
      />
    );
    const disabledDate = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('disabledDate');
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      false
    );
  });

  it('sets end date disabled when start date after given date', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="2019-11-22--"
      />
    );
    const disabledDate = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('disabledDate');
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      true
    );
  });

  it('does not set end date disabled when start date is before than given date', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter
        onChange={onChange}
        range="2019-11-22--"
      />
    );
    const disabledDate = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('disabledDate');
    expect(disabledDate(moment(new Date('2019-11-29T13:31:00+00:00')))).toBe(
      false
    );
  });

  it('does not set start date disabled when there is no end date', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const disabledDate = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('disabledDate');
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      false
    );
  });

  it('does not set end date disabled when there is no start date', () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const disabledDate = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('disabledDate');
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      false
    );
  });
});
