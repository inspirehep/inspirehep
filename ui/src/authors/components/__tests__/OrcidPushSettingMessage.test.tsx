import React from 'react';
import { shallow } from 'enzyme';

import OrcidPushSettingMessage from '../OrcidPushSettingMessage';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('OrcidPushSettingMessage', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when enabled', () => {
    const wrapper = shallow(
      <OrcidPushSettingMessage orcid="0000-0001-8058-0014" enabled />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when disabled', () => {
    const wrapper = shallow(
      <OrcidPushSettingMessage orcid="0000-0001-8058-0014" enabled={false} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
