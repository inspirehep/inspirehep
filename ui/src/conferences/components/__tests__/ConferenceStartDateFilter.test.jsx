import React from 'react';
import { shallow } from 'enzyme';
import { Switch } from 'antd';


import ConferenceStartDateFilter from '../ConferenceStartDateFilter';
import { START_DATE_ALL, START_DATE_UPCOMING, RANGE_AGGREGATION_SELECTION_SEPARATOR as SEPARATOR } from '../../../common/constants';
import DateRangeFilter from '../../../common/components/DateRangeFilter';

describe('ConferenceStartDateFilter', () => {
  it('renders with selection: all', () => {
    const wrapper = shallow(<ConferenceStartDateFilter selection={START_DATE_ALL} onChange={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with selection: upcoming', () => {
    const wrapper = shallow(<ConferenceStartDateFilter selection={START_DATE_UPCOMING} onChange={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with selection: a date range', () => {
    const wrapper = shallow(<ConferenceStartDateFilter selection={`2019-05-05${SEPARATOR}2020-01-01`} onChange={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without selection', () => {
    const wrapper = shallow(<ConferenceStartDateFilter onChange={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onChange with "all" when date range filter is cleared', () => {
    const onChange = jest.fn();
    const wrapper = shallow(<ConferenceStartDateFilter onChange={onChange} />);
    const onDateRangeFilterChange = wrapper
      .find(DateRangeFilter)
      .prop('onChange');
    onDateRangeFilterChange(undefined);
    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  it('calls onChange with range on date range filter change', () => {
    const onChange = jest.fn();
    const wrapper = shallow(<ConferenceStartDateFilter onChange={onChange} />);
    const onDateRangeFilterChange = wrapper
      .find(DateRangeFilter)
      .prop('onChange');
    const range = `2019-05-05${SEPARATOR}2020-01-01`
    onDateRangeFilterChange(range);
    expect(onChange).toHaveBeenCalledWith(range);
  });

  it('calls onChange with "upcoming", after animation if switch is checked', () => {
    const onChange = jest.fn();
    const wrapper = shallow(<ConferenceStartDateFilter onChange={onChange} />);
    const onSwitchChange = wrapper.find(Switch)
      .prop('onChange');
    onSwitchChange(true);

    const onSwitchAnimationEnd = wrapper.find(Switch)
      .prop('onAnimationEnd');
    onSwitchAnimationEnd();
    expect(onChange).toHaveBeenCalledWith(START_DATE_UPCOMING);
  });

  it('calls onChange with "all", after animation if switch is unchecked', () => {
    const onChange = jest.fn();
    const wrapper = shallow(<ConferenceStartDateFilter onChange={onChange} />);
    
    const onSwitchChange = wrapper.find(Switch)
      .prop('onChange');
    onSwitchChange(false);

    const onSwitchAnimationEnd = wrapper.find(Switch)
      .prop('onAnimationEnd');
    onSwitchAnimationEnd();
    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  it('calls onChange once on each switch change even if onAnimationEnd triggered multiple times', () => {
    const onChange = jest.fn();
    const wrapper = shallow(<ConferenceStartDateFilter onChange={onChange} />);
    const onSwitchChange = wrapper.find(Switch)
      .prop('onChange');
    onSwitchChange(false);

    const onSwitchAnimationEnd = wrapper.find(Switch)
      .prop('onAnimationEnd');
    onSwitchAnimationEnd();
    onSwitchAnimationEnd();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
