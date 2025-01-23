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

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <JournalItem result={result} />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with some props undefined', () => {
    const result = fromJS({
      metadata: fromJS({
        short_title: 'West Virginia U.',
        control_number: 1234,
        journal_title: 'Department of Physics',
      }),
    });

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <JournalItem result={result} />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
