import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { fromJS } from 'immutable';

import { renderWithProviders } from '../../../../fixtures/render';
import DetailPageContainer from '../DetailPageContainer';
import { getStore } from '../../../../fixtures/store';

describe('DetailPageContainer', () => {
  const renderComponent = (citations_count: number = 666) => {
    const store = getStore({
      data: fromJS({
        data: {
          metadata: {
            titles: [
              {
                source: 'pariatur adipisicing amet',
                subtitle: 'voluptate eiusmod fugiat',
                title: 'Test title',
              },
            ],
            authors: [
              {
                affiliations: [
                  {
                    curated_relation: true,
                    record: {
                      $ref: 'http://M1/api/institutions/12346',
                    },
                    value: 'ut',
                  },
                ],
              },
            ],
            urls: [{ value: 'http://url.com' }],
            dois: [
              {
                source: 'in ad et',
                value: '10.8756/tTM',
                material: 'data',
              },
              {
                source: 'mollit deserunt eu',
                value: '10.5/.Aww=bT@',
                material: 'version',
              },
              {
                source: 'adipisicing et',
                value: '10.0.9747720/#}O=W:$',
                material: 'part',
              },
            ],
            date: 'Feb 5, 2025',
            control_number: 1234,
            citation_count: citations_count,
            accelerator_experiments: [
              {
                record: {
                  $ref: 'http://localhost:8080/api/experiments/1513946',
                },
                name: 'LATTICE-ETM',
              },
            ],
          },
        },
      }),
      user: fromJS({
        loggedIn: true,
      }),
    });

    const renderedComponent = renderWithProviders(<DetailPageContainer />, {
      store,
    });

    return renderedComponent;
  };

  it('renders initial state', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with `0` citation count', () => {
    const { getByText } = renderComponent(0);

    expect(getByText('0 citations')).toBeInTheDocument();
  });

  it('renders with the creation date', () => {
    const { getByText } = renderComponent();

    expect(getByText('Feb 5, 2025')).toBeInTheDocument();
  });

  it('renders the experiments', () => {
    const { getByText } = renderComponent();

    expect(getByText('LATTICE-ETM')).toBeInTheDocument();
  });
});
