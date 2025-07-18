import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import DetailPageContainer from '../DetailPageContainer';
import { getStore } from '../../../../fixtures/store';
import { CITE_FORMAT_PREFERENCE } from '../../../../reducers/user';
import { renderWithProviders } from '../../../../fixtures/render';

describe('DetailPageContainer', () => {
  it('renders initial state', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
      {
        full_name: 'Test, Guy 4',
      },
      {
        full_name: 'Test, Guy 5',
      },
      {
        full_name: 'Test, Guy 6',
      },
    ]);
    const record = { $ref: 'http://localhost:5000/api/literature/1234' };
    const supervisors = fromJS([
      {
        uuid: '123',
        full_name: 'John Doe',
      },
      {
        uuid: '456',
        full_name: 'Jane Doe',
      },
    ]);

    const store = getStore({
      literature: fromJS({
        authors,
        data: {
          record,
          metadata: {
            control_number: 1234,
            titles: [
              {
                title: 'Detail view',
              },
            ],
          },
          created: '2025-01-01',
        },
        supervisors,
        totalReferences: 2,
        references: [{ control_number: 1 }, { control_number: 2 }],
      }),
      search: fromJS({
        namespaces: {
          literatureSeminars: {
            initialTotal: 2,
          },
        },
      }),
      user: fromJS({
        loggedIn: true,
        preferences: {
          [CITE_FORMAT_PREFERENCE]: 'application/x-bibtex',
        },
        data: {
          profile_control_number: null,
        },
      }),
    });

    const { asFragment } = renderWithProviders(
      <Router>
        <DetailPageContainer />
      </Router>,
      { store }
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
