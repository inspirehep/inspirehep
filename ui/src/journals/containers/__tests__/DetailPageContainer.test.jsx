import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { render, screen } from '@testing-library/react';
import { getStore } from '../../../fixtures/store';
import DetailPageContainer from '../DetailPageContainer';

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

    const { getByTestId } = render(
      <Router>
        <Provider store={store}>
          <DetailPageContainer />
        </Provider>
      </Router>
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
  });
});
