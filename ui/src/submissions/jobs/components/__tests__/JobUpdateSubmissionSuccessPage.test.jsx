import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import JobUpdateSubmissionSuccessPage from '../JobUpdateSubmissionSuccessPage';
import { getStore } from '../../../../fixtures/store';

describe('JobUpdateSubmissionSuccessPage', () => {
  it('renders', () => {
    const match = { params: { id: '1' } };
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter
          initialEntries={[`/submissions/jobs/${match.params.id}/success`]}
        >
          <JobUpdateSubmissionSuccessPage match={match} />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
