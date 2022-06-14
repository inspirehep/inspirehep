import React from 'react';
import { shallow } from 'enzyme';

import OrcidProfileLink from '../OrcidProfileLink';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('OrcidProfileLink', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const wrapper = shallow(
      <OrcidProfileLink className="test" orcid="0000-0001-8058-0014">
        Orcid: <strong>0000-0001-8058-0014</strong>
      </OrcidProfileLink>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only orcid', () => {
    const wrapper = shallow(<OrcidProfileLink orcid="0000-0001-8058-0014" />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
