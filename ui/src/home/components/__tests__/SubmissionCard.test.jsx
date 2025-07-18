import React from 'react';

import SubmissionCard from '../SubmissionCard';
import { renderWithRouter } from '../../../fixtures/render';

describe('SubmissionCard', () => {
  it('renders with all props', () => {
    const title = 'Literature';
    const formLink = '/submissions/literature';
    const children = 'You can suggest us papers!';

    const { getByText, getByRole } = renderWithRouter(
      <SubmissionCard title={title} formLink={formLink}>
        {children}
      </SubmissionCard>
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(children)).toBeInTheDocument();
    expect(getByRole('link', { name: /Submit/i })).toHaveAttribute(
      'href',
      '/submissions/literature'
    );
  });
});
