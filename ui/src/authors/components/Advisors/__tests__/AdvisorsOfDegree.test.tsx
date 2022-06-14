import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AdvisorsOfDegree from '../AdvisorsOfDegree';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AdvisorsOfDegree', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders other advisors', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
      },
      {
        name: 'Another Dude',
        degree_type: 'other',
      },
    ]);
    const wrapper = shallow(
      <AdvisorsOfDegree advisors={advisors} degreeType="other" />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders phd advisors', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
        degree_type: 'phd',
      },
      {
        name: 'Another Dude',
        degree_type: 'phd',
      },
    ]);
    const wrapper = shallow(
      <AdvisorsOfDegree advisors={advisors} degreeType="phd" />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders the master advisor', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
        degree_type: 'master',
      },
    ]);
    const wrapper = shallow(
      <AdvisorsOfDegree advisors={advisors} degreeType="master" />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
