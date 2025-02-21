import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SubmissionCard from '../SubmissionCard';

describe('SubmissionCard', () => {
  it('renders with all props', () => {
    const title = 'Literature';
    const formLink = '/submissions/literature';
    const children = 'You can suggest us papers!';

    const { getByText, getByRole } = render(
      <MemoryRouter>
        <SubmissionCard title={title} formLink={formLink}>
          {children}
        </SubmissionCard>
      </MemoryRouter>
    );

    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(children)).toBeInTheDocument();
    expect(getByRole('link', { name: /Submit/i })).toHaveAttribute(
      'href',
      '/submissions/literature'
    );
  });
});
