import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import KeywordList from '../KeywordList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('KeywordList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with keywords', () => {
    const keywords = fromJS([
      {
        value: 'CMS',
      },
      {
        value: 'LHC-B',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<KeywordList keywords={keywords} />);
    // FIXME: we need to .dive().dive() to be able test list items
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
