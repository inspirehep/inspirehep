import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import ConferenceContributionLink from '../ConferenceContributionLink';
import { getStore } from '../../../fixtures/store';

describe('ConferenceContributionLink', () => {
  it('renders ConferenceContributionLink', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <ConferenceContributionLink
            recordId="123456"
            contributionsCount={25}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
