import React from 'react';
import { shallow } from 'enzyme';

import OrcidPushSettingMessage from '../OrcidPushSettingMessage';

describe('OrcidPushSettingMessage', () => {
  it('renders when enabled', () => {
    const wrapper = shallow(
      <OrcidPushSettingMessage orcid="0000-0001-8058-0014" enabled />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when disabled', () => {
    const wrapper = shallow(
      <OrcidPushSettingMessage orcid="0000-0001-8058-0014" enabled={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
