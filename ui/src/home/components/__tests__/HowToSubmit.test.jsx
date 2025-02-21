import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HowToSubmit from '../HowToSubmit';
import {
  SUBMISSIONS_AUTHOR,
  SUBMISSIONS_CONFERENCE,
  SUBMISSIONS_JOB,
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_SEMINAR,
} from '../../../common/routes';

describe('HowToSubmit', () => {
  it('renders the component with correct content', () => {
    const { getByText, getAllByRole } = render(
      <MemoryRouter>
        <HowToSubmit />
      </MemoryRouter>
    );

    expect(getByText('Literature')).toBeInTheDocument();
    expect(getByText('Author')).toBeInTheDocument();
    expect(getByText('Job')).toBeInTheDocument();
    expect(getByText('Seminar')).toBeInTheDocument();
    expect(getByText('Conference')).toBeInTheDocument();

    const links = getAllByRole('link', { name: 'Submit' });
    expect(links[0]).toHaveAttribute('href', SUBMISSIONS_LITERATURE);
    expect(links[1]).toHaveAttribute('href', SUBMISSIONS_AUTHOR);
    expect(links[2]).toHaveAttribute('href', SUBMISSIONS_JOB);
    expect(links[3]).toHaveAttribute('href', SUBMISSIONS_SEMINAR);
    expect(links[4]).toHaveAttribute('href', SUBMISSIONS_CONFERENCE);
  });
});
