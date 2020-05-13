import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import EventSeries from '../EventSeries';

describe('EventSeries', () => {
  it('renders with only name', () => {
    const series = fromJS([{ name: 'Conference Name' }]);
    const wrapper = shallow(<EventSeries series={series} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
  it('renders with name and number', () => {
    const series = fromJS([{ name: 'Conference Name', number: 10 }]);
    const wrapper = shallow(<EventSeries series={series} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
  it('renders several series', () => {
    const series = fromJS([
      { name: 'Conference 1' },
      { name: 'Conference 2', number: 10 },
      { name: 'Conference 3' },
    ]);
    const wrapper = shallow(<EventSeries series={series} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
