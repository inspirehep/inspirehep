import React from 'react';
import { shallow } from 'enzyme';
import EditRecordAction from '../EditRecordAction.tsx';
import {
  INSTITUTIONS_PID_TYPE,
  JOBS_PID_TYPE,
  CONFERENCES_PID_TYPE,
  AUTHORS_PID_TYPE,
  LITERATURE_PID_TYPE,
  SEMINARS_PID_TYPE,
} from '../../constants';

describe('EditRecordAction', () => {
  it('renders edit button with pidType literature and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType={LITERATURE_PID_TYPE} pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType authors and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType={AUTHORS_PID_TYPE} pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType conferences and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType={CONFERENCES_PID_TYPE} pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType jobs and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType={JOBS_PID_TYPE} pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType institutions and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType={INSTITUTIONS_PID_TYPE} pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders edit button with pidType seminars and pidValue', () => {
    const wrapper = shallow(
      <EditRecordAction pidType={SEMINARS_PID_TYPE} pidValue={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
