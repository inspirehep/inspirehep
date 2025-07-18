import React from 'react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../fixtures/render';
import { JournalItem } from '../JournalItem';

describe('JournalItem', () => {
  it('renders with props', () => {
    const result = fromJS({
      metadata: fromJS({
        short_title: 'West Virginia U.',
        publisher: ['Liverpool'],
        urls: [{ value: 'http://url.com' }],
        control_number: 1234,
        journal_title: { title: 'Department of Physics' },
        number_of_papers: 2,
      }),
    });

    const { getByText, getByRole } = renderWithProviders(
      <JournalItem result={result} />
    );
    expect(getByText('West Virginia U.')).toBeInTheDocument();
    expect(getByText('2 papers')).toBeInTheDocument();

    const link = getByRole('link', { name: 'login 2 papers' });
    expect(link).toHaveAttribute(
      'href',
      '/literature?sort=mostrecent&size=25&page=1&q=publication_info.journal_title.raw:"West Virginia U."'
    );
  });

  it('renders with some props undefined', () => {
    const result = fromJS({
      metadata: fromJS({
        short_title: 'West Virginia U.',
        control_number: 1234,
        journal_title: 'Department of Physics',
      }),
    });

    const { getByText, getByRole } = renderWithProviders(
      <JournalItem result={result} />
    );
    expect(getByText('West Virginia U.')).toBeInTheDocument();
    expect(getByText('Department of Physics')).toBeInTheDocument();
    const link = getByRole('link', { name: 'West Virginia U.' });
    expect(link).toHaveAttribute('href', '/journals/1234');
  });
});
