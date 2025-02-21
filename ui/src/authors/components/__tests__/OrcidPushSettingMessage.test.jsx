import React from 'react';
import { render } from '@testing-library/react';

import OrcidPushSettingMessage from '../OrcidPushSettingMessage';

describe('OrcidPushSettingMessage', () => {
  it('renders when enabled', () => {
    const { asFragment } = render(
      <OrcidPushSettingMessage orcid="0000-0001-8058-0014" enabled />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders when disabled', () => {
    const { asFragment } = render(
      <OrcidPushSettingMessage orcid="0000-0001-8058-0014" enabled={false} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
