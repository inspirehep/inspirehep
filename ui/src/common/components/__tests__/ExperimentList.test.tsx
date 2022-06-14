import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ExperimentList from '../ExperimentList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExperimentList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders arxiv categories', () => {
    const experiments = fromJS([
      {
        name: 'CERN-LHC-CMS',
        record: { $ref: 'http://labs.inspirehep.net/api/experiments/1110623' },
      },
      { name: 'CERN-LHC-LHCb' },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ExperimentList experiments={experiments} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
