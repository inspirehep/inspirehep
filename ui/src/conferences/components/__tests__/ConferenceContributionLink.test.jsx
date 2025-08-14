import React from 'react';
import { renderWithProviders } from '../../../fixtures/render';
import ConferenceContributionLink from '../ConferenceContributionLink';
import { getStore } from '../../../fixtures/store';

describe('ConferenceContributionLink', () => {
  it('renders ConferenceContributionLink', () => {
    const { asFragment } = renderWithProviders(
      <ConferenceContributionLink recordId="123456" contributionsCount={25} />,
      {
        store: getStore(),
        route: '/',
      }
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
