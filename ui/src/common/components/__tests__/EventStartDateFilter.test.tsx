import React from 'react';
import { shallow } from 'enzyme';
import { Switch } from 'antd';

import {
  START_DATE_ALL,
  START_DATE_UPCOMING,
  RANGE_AGGREGATION_SELECTION_SEPARATOR as SEPARATOR,
} from '../../constants';
import DateRangeFilter from '../DateRangeFilter';
import EventStartDateFilter from '../EventStartDateFilter';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EventStartDateFilter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with selection: all', () => {
    const wrapper = shallow(
      <EventStartDateFilter
        selection={START_DATE_ALL}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with selection: upcoming', () => {
    const wrapper = shallow(
      <EventStartDateFilter
        selection={START_DATE_UPCOMING}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with selection: a date range', () => {
    const wrapper = shallow(
      <EventStartDateFilter
        selection={`2019-05-05${SEPARATOR}2020-01-01`}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without selection', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      <EventStartDateFilter onChange={jest.fn()} switchTitle="Upcoming items" />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with "all" when date range filter is cleared', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onDateRangeFilterChange = wrapper
      .find(DateRangeFilter)
      .prop('onChange');
    onDateRangeFilterChange(undefined);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with range on date range filter change', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onDateRangeFilterChange = wrapper
      .find(DateRangeFilter)
      .prop('onChange');
    const range = `2019-05-05${SEPARATOR}2020-01-01`;
    onDateRangeFilterChange(range);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(range);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with "upcoming", after animation if switch is checked', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(true);

    const onSwitchAnimationEnd = wrapper.find(Switch).prop('onAnimationEnd');
    (onSwitchAnimationEnd as $TSFixMe)();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(START_DATE_UPCOMING);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with "all", after animation if switch is unchecked', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(false);

    const onSwitchAnimationEnd = wrapper.find(Switch).prop('onAnimationEnd');
    (onSwitchAnimationEnd as $TSFixMe)();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange once on each switch change even if onAnimationEnd triggered multiple times', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(false);

    const onSwitchAnimationEnd = wrapper.find(Switch).prop('onAnimationEnd');
    (onSwitchAnimationEnd as $TSFixMe)();
    (onSwitchAnimationEnd as $TSFixMe)();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
