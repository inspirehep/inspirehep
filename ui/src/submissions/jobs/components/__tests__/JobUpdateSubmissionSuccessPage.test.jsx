import React from 'react';
import { renderWithProviders } from '../../../../fixtures/render';

import JobUpdateSubmissionSuccessPage from '../JobUpdateSubmissionSuccessPage';
import { getStore } from '../../../../fixtures/store';

describe('JobUpdateSubmissionSuccessPage', () => {
  it('renders', () => {
    const match = { params: { id: '1' } };
    const { asFragment } = renderWithProviders(
      <JobUpdateSubmissionSuccessPage match={match} />,
      {
        route: `/submissions/jobs/${match.params.id}/success`,
        store: getStore(),
      }
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
