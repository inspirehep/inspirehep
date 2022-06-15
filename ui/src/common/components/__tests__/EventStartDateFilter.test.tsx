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


describe('EventStartDateFilter', () => {
  
  it('renders with selection: all', () => {
    const wrapper = shallow(
      <EventStartDateFilter
        selection={START_DATE_ALL}
        
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with selection: upcoming', () => {
    const wrapper = shallow(
      <EventStartDateFilter
        selection={START_DATE_UPCOMING}
        
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with selection: a date range', () => {
    const wrapper = shallow(
      <EventStartDateFilter
        selection={`2019-05-05${SEPARATOR}2020-01-01`}
        
        onChange={jest.fn()}
        switchTitle="Upcoming items"
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders without selection', () => {
    const wrapper = shallow(
      
      <EventStartDateFilter onChange={jest.fn()} switchTitle="Upcoming items" />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onChange with "all" when date range filter is cleared', () => {
    
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onDateRangeFilterChange = wrapper
      .find(DateRangeFilter)
      .prop('onChange');
    onDateRangeFilterChange(undefined);
    
    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  
  it('calls onChange with range on date range filter change', () => {
    
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onDateRangeFilterChange = wrapper
      .find(DateRangeFilter)
      .prop('onChange');
    const range = `2019-05-05${SEPARATOR}2020-01-01`;
    onDateRangeFilterChange(range);
    
    expect(onChange).toHaveBeenCalledWith(range);
  });

  
  it('calls onChange with "upcoming", after animation if switch is checked', () => {
    
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(true);

    const onSwitchAnimationEnd = wrapper.find(Switch).prop('onAnimationEnd');
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onSwitchAnimationEnd();
    
    expect(onChange).toHaveBeenCalledWith(START_DATE_UPCOMING);
  });

  
  it('calls onChange with "all", after animation if switch is unchecked', () => {
    
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );

    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(false);

    const onSwitchAnimationEnd = wrapper.find(Switch).prop('onAnimationEnd');
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onSwitchAnimationEnd();
    
    expect(onChange).toHaveBeenCalledWith(START_DATE_ALL);
  });

  
  it('calls onChange once on each switch change even if onAnimationEnd triggered multiple times', () => {
    
    const onChange = jest.fn();
    const wrapper = shallow(
      <EventStartDateFilter onChange={onChange} switchTitle="Upcoming items" />
    );
    const onSwitchChange = wrapper.find(Switch).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onSwitchChange(false);

    const onSwitchAnimationEnd = wrapper.find(Switch).prop('onAnimationEnd');
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onSwitchAnimationEnd();
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onSwitchAnimationEnd();
    
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
