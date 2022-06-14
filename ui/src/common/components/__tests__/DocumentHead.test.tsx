import React from 'react';
import { shallow } from 'enzyme';

import DocumentHead from '../DocumentHead';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DocumentHead', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only title', () => {
    const wrapper = shallow(<DocumentHead title="Jessica Jones" />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with title, description and children', () => {
    const wrapper = shallow(
      <DocumentHead title="Page Title" description="This is a test page">
        <meta name="citation_title" content="Page Title" />
      </DocumentHead>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
