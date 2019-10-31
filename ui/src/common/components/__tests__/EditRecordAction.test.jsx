import React from 'react';
import { shallow } from 'enzyme';
import EditRecordAction from '../EditRecordAction';

describe('EditRecordAction', () => {
  it('renders edit button with pidType literature and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType="literature" pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType jobs and pidValue', () => {
    const wrapper = shallow(<EditRecordAction pidType="jobs" pidValue={1} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType jobs and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType="authors" pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType conferences and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType="conferences" pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
