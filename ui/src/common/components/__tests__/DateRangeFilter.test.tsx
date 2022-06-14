import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import { advanceTo, clear } from 'jest-date-mock';
import DateRangeFilter from '../DateRangeFilter';
import { DATE_RANGE_FORMAT } from '../../constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DateRangeFilter', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
  afterEach(() => {
    clear();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders DateRangeFilter with all props set', () => {
    const wrapper = shallow(
      <DateRangeFilter
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        range="2019-11-21--2019-11-22"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders DateRangeFilter without range', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      <DateRangeFilter onChange={jest.fn()} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange when start date selected and no range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const currentDate = advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const onStartDateChanged = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      moment(currentDate),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith('2019-05-28--');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange when start date selected and there are range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      moment(currentDate),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith('2019-05-28--2019-11-22');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange when end date selected and there are range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      moment(currentDate),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith('2019-04-21--2019-05-28');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange when end date selected and no range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const currentDate = advanceTo(new Date('2019-05-28T13:31:00+00:00'));
    const onStartDateChanged = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      moment(currentDate),
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      moment(currentDate).format(DATE_RANGE_FORMAT)
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith('--2019-05-28');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with cleared start date when start date is removed and there are range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(null, '');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith('--2019-11-22');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with cleared start date when start date is removed and no range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const onStartDateChanged = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(null, '');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with cleared end date when end date is removed and there are range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(null, '');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith('2019-04-21--');
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with cleared end date when end date is removed and no range', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const onStartDateChanged = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onStartDateChanged(null, '');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets start date disabled when end date before given date', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disabledDate(moment(new Date('2019-11-28T13:31:00+00:00')))).toBe(
      true
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not set start date disabled when end date is later than given date', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      false
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets end date disabled when start date after given date', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      true
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not set end date disabled when start date is before than given date', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disabledDate(moment(new Date('2019-11-29T13:31:00+00:00')))).toBe(
      false
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not set start date disabled when there is no end date', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const disabledDate = wrapper
      .find('[data-test-id="start-date-picker"]')
      .prop('disabledDate');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      false
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not set end date disabled when there is no start date', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <DateRangeFilter onChange={onChange} />
    );
    const disabledDate = wrapper
      .find('[data-test-id="end-date-picker"]')
      .prop('disabledDate');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(disabledDate(moment(new Date('2019-11-21T13:31:00+00:00')))).toBe(
      false
    );
  });
});
