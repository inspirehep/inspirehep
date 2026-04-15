import React from 'react';
import { screen } from '@testing-library/react';
import { List } from 'immutable';

import { renderWithRouter } from '../../../../fixtures/render';
import ExactMatchesCallout from '../ExactMatchesCallout';

describe('ExactMatchesCallout', () => {
  it('renders duplicate IDs, search link and restart note', () => {
    renderWithRouter(
      <ExactMatchesCallout exactMatches={List([3076804, 3143839])} />
    );

    expect(screen.getByText('Duplicate IDs:')).toBeInTheDocument();
    expect(screen.getByText('3076804 or 3143839')).toBeInTheDocument();
    expect(
      screen.getByText(
        'When you resolve this error, restart the workflow to continue'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /3076804 or 3143839/i })
    ).toHaveAttribute(
      'href',
      '/literature/search?q=recid:3076804+or+recid:3143839'
    );
  });
});
