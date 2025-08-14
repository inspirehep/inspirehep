import React from 'react';

import { renderWithProviders } from '../../../fixtures/render';

import ConferenceContributions from '../ConferenceContributions';

describe('ConferenceContributions', () => {
  it('renders', () => {
    const { container } = renderWithProviders(
      <ConferenceContributions conferenceRecordId="12345" />
    );
    expect(container).toMatchSnapshot();
  });
});
