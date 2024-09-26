import React from 'react';
import { shallow } from 'enzyme';

import ExperimentDates from '../ExperimentDates';

describe('ExperimentDates', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(
      <ExperimentDates
        dateApproved="1984-02-02"
        dateProposed="1984-02-01"
        dateStarted="1984-02-03"
        dateCancelled="1984-02-04"
        dateCompleted="1984-02-05"
        wrapperClassName="di"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders without dateCancelled or dateCompleted', () => {
    const wrapper = shallow(
      <ExperimentDates
        dateApproved="1984-02-02"
        dateProposed="1984-02-01"
        dateStarted="1984-02-03"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders with partial dates', () => {
    const wrapper = shallow(
      <ExperimentDates
        dateApproved="1984-02"
        dateProposed="1984"
        dateStarted="1984-02-03"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
