import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import EventSeries from '../EventSeries';
import { CONFERENCES_PID_TYPE, SEMINARS_PID_TYPE } from '../../constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EventSeries', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only name', () => {
    const series = fromJS([{ name: 'Conference Name' }]);
    const wrapper = shallow(
      <EventSeries series={series} pidType={CONFERENCES_PID_TYPE} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders conference series with name and number', () => {
    const series = fromJS([{ name: 'Conference Name', number: 10 }]);
    const wrapper = shallow(
      <EventSeries series={series} pidType={CONFERENCES_PID_TYPE} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders several series', () => {
    const series = fromJS([
      { name: 'Conference 1' },
      { name: 'Conference 2', number: 10 },
      { name: 'Conference 3' },
    ]);
    const wrapper = shallow(
      <EventSeries series={series} pidType={CONFERENCES_PID_TYPE} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders seminar series with name and number', () => {
    const series = fromJS([{ name: 'Seminar Name', number: 10 }]);
    const wrapper = shallow(
      <EventSeries series={series} pidType={SEMINARS_PID_TYPE} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
