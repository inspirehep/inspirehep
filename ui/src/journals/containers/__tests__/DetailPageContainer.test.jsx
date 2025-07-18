import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { fromJS } from 'immutable';
import { screen } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import DetailPageContainer from '../DetailPageContainer';
import { renderWithProviders } from '../../../fixtures/render';

describe('DetailPageContainer', () => {
  it('renders journals details correctly', () => {
    const store = getStore({
      journals: fromJS({
        data: {
          metadata: {
            short_title: 'short test',
            journal_title: { title: 'test' },
            urls: [{ value: 'https://www.springer.com/journal/526' }],
            public_notes: [{ value: 'Started with 1997, v.9701' }],
            title_variants: [
              'JOURNAL OF HIGH ENERGY PHYSICS',
              'JOURNL OF HIGH ENERGY PHYSICS',
            ],
            publisher: ['Springer'],
            control_number: 1234,
          },
        },
      }),
    });

    const { getByTestId } = renderWithProviders(
      <Router>
        <DetailPageContainer />
      </Router>,
      { store }
    );

    const detailPage = getByTestId('journals-detail-page-container');
    expect(detailPage).toBeInTheDocument();
    expect(detailPage).toHaveTextContent('test');
    expect(detailPage).toHaveTextContent('Show other names (2)');
    expect(detailPage).toHaveTextContent('Springer');
    expect(detailPage).toHaveTextContent('Started with 1997, v.9701');

    const link = screen.getByRole('link', { name: /links/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://www.springer.com/journal/526'
    );
    expect(link).toHaveAttribute('target', '_blank');

    const link2 = screen.getByRole('link', { name: /Articles published in/i });
    expect(link2).toBeInTheDocument();
    expect(link2).toHaveAttribute(
      'href',
      '/literature?sort=mostrecent&size=25&page=1&q=publication_info.journal_title.raw:"short test"'
    );
  });
});
