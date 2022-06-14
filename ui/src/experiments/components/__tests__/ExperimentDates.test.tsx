import React from 'react';
import { shallow } from 'enzyme';

import ExperimentDates from '../ExperimentDates';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExperimentDates', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without dateCancelled or dateCompleted', () => {
    const wrapper = shallow(
      <ExperimentDates
        dateApproved="1984-02-02"
        dateProposed="1984-02-01"
        dateStarted="1984-02-03"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with partial dates', () => {
    const wrapper = shallow(
      <ExperimentDates
        dateApproved="1984-02"
        dateProposed="1984"
        dateStarted="1984-02-03"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
