import React from 'react';
import { shallow } from 'enzyme';

import AuthorOrcid from '../AuthorOrcid';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorOrcid', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with orcid', () => {
    const orcid = '0000-0001-8058-0014';
    const wrapper = shallow(<AuthorOrcid orcid={orcid} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
