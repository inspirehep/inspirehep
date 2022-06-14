import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AffiliationList from '../AffiliationList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AffiliationList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders author with one affiliation', () => {
    const affiliations = fromJS([
      {
        value: 'CERN2',
        record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<AffiliationList affiliations={affiliations} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders author with multiple affiliations', () => {
    const affiliations = fromJS([
      {
        value: 'CERN2',
        record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
      },
      {
        value: 'CERN1',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<AffiliationList affiliations={affiliations} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
