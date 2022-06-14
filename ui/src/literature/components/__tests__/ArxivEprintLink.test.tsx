import React from 'react';
import { shallow } from 'enzyme';

import ArxivEprintLink from '../ArxivEprintLink';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ArxivEprintLink', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with arXiv id', () => {
    const wrapper = shallow((
      <ArxivEprintLink>
        123.123456
      </ArxivEprintLink>
    ));
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
