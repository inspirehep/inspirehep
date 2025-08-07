import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { JournalItem } from '../JournalItem';
import { getStore } from '../../../fixtures/store';

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

    const { getByText, getByRole } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <JournalItem result={result} />
        </MemoryRouter>
      </Provider>
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

    const { getByText, getByRole } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <JournalItem result={result} />
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('West Virginia U.')).toBeInTheDocument();
    expect(getByText('Department of Physics')).toBeInTheDocument();
    const link = getByRole('link', { name: 'West Virginia U.' });
    expect(link).toHaveAttribute('href', '/journals/1234');
  });
});
