import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { Set, fromJS } from 'immutable';

import AssignConferencesDrawer from '../AssignConferencesDrawer';
import { getStore } from '../../../fixtures/store';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

describe('AssignConferencesDrawer', () => {
  beforeAll(() => {
    const rootElement = document.createElement('div');
    rootElement.setAttribute('id', 'root');
    document.body.appendChild(rootElement);
  });

  it('renders assign conferences search', () => {
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const { baseElement } = renderWithProviders(
      <AssignConferencesDrawer
        visible
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();

    const selectedPapers = Set([1, 2, 3]);

    const store = getStore({
      search: fromJS({
        namespaces: {
          assignConference: {
            loading: false,
            initialTotal: null,
            total: 1,
            error: null,
            baseQuery: {
              sort: 'mostrecent',
              size: '25',
              page: '1',
              q: '',
            },
            query: {
              sort: 'mostrecent',
              size: '25',
              page: '1',
              q: '',
            },
            baseAggregationsQuery: {},
            results: [
              {
                metadata: {
                  control_number: 123,
                  titles: [
                    {
                      title: 'Jessica Jones Conference',
                    },
                  ],
                  acronyms: [{ acronym: 'JJC' }],
                  opening_date: '2023-01-01',
                  closing_date: '2023-01-03',
                  addresses: [],
                  cnum: 'C23-01-01',
                  can_edit: false,
                  inspire_categories: [],
                  urls: [{ value: 'aaa.com' }],
                  proceedings: null,
                  number_of_contributions: 0,
                },
              },
            ],
          },
        },
      }),
    });

    renderWithProviders(
      <AssignConferencesDrawer
        visible
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />,
      { store }
    );

    const assignButton = screen.getByTestId('assign-conference-button');
    expect(assignButton).toBeDisabled();

    const radioButton = screen.getByRole('radio');
    fireEvent.click(radioButton);

    expect(assignButton).not.toBeDisabled();

    fireEvent.click(assignButton);
    expect(onAssign).toHaveBeenCalledWith(123, 'Jessica Jones Conference');
  });
});
