import React from 'react';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../../fixtures/render';

import { getStore } from '../../../../fixtures/store';
import AuthorSubmissionPageContainer from '../AuthorSubmissionPageContainer';
import { SUBMISSIONS_AUTHOR } from '../../../../common/routes';

describe('AuthorSubmissionPageContainer', () => {
  it('should display the "Do you want to update your profile?" message when profileControlNumber is provided', () => {
    const store = getStore({
      router: { location: { query: { bai: 'bai123' } } },
      user: fromJS({ data: { profile_control_number: 12345 } }),
    });

    renderWithProviders(<AuthorSubmissionPageContainer />, { store });

    expect(
      screen.getByText(/Do you want to update your profile\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'author update form' })
    ).toHaveAttribute('href', `${SUBMISSIONS_AUTHOR}/12345`);
  });

  it('should not display the "Do you want to update your profile?" message when profileControlNumber is null', () => {
    const store = getStore({
      router: { location: { query: { bai: 'bai123' } } },
      user: fromJS({ data: { profile_control_number: null } }),
    });

    renderWithProviders(<AuthorSubmissionPageContainer />, { store });

    expect(
      screen.queryByText(/Do you want to update your profile\?/i)
    ).not.toBeInTheDocument();
  });
});
