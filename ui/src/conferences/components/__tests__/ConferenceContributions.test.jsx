import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import ConferenceContributions from '../ConferenceContributions';
import { getStore } from '../../../fixtures/store';

describe('ConferenceContributions', () => {
  it('renders', () => {
    const { container } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <ConferenceContributions conferenceRecordId="12345" />
        </MemoryRouter>
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });
});
