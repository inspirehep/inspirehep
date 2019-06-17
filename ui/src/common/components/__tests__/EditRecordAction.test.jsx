import React from 'react';
import { shallow } from 'enzyme';
import EditRecordAction from '../EditRecordAction';

describe('EditRecordAction', () => {
  it('renders edit button with pidType literature and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType='literature' pidValue={1}/>
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType jobs and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType='jobs' pidValue={1}/>
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
