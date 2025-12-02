import React from 'react';
import { fromJS } from 'immutable';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import LiteratureDetailPageContainer from '../LiteratureDetailPageContainer';
import { getStore } from '../../../../fixtures/store';
import { renderWithProviders } from '../../../../fixtures/render';
import { BACKOFFICE } from '../../../../common/routes';

describe('LiteratureDetailPageContainer', () => {
  const renderComponent = () => {
    const store = getStore({
      backoffice: fromJS({
        loading: false,
        loggedIn: true,
        literature: fromJS({
          data: {
            titles: [
              {
                title:
                  'CuMPerLay: Learning Cubical Multiparameter Persistence Vectorizations',
                source: 'arXiv',
              },
            ],
            abstracts: [
              {
                value:
                  'We present CuMPerLay, a novel differentiable vectorization layer...',
                source: 'arXiv',
              },
            ],
            inspire_categories: [
              { term: 'Computing', source: 'arxiv' },
              { term: 'Math and Math Physics', source: 'arxiv' },
              { term: 'Data Analysis and Statistics', source: 'arxiv' },
            ],
            acquisition_source: {
              method: 'hepcrawl',
              source: 'arXiv',
              datetime: '2025-10-15T02:00:46.021938',
            },
            document_type: ['article'],
            preprint_date: '2025-10-14',
            curated: false,
            urls: [
              {
                description: 'Fermilab Library Server',
                value:
                  'https://lss.fnal.gov/archive/2025/pub/fermilab-pub-25-0393-ppd.pdf',
              },
            ],
          },
          status: 'approval',
          tickets: [
            { ticket_id: 'SNOW-123', ticket_url: 'https://snow/123' },
            { ticket_id: 'SNOW-456', ticket_url: 'https://snow/456' },
          ],
        }),
      }),
    });

    const renderedComponent = renderWithProviders(
      <LiteratureDetailPageContainer />,
      {
        store,
        route: `${BACKOFFICE}/1`,
      }
    );

    return { renderedComponent, store };
  };

  it('shows the title and abstract', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'CuMPerLay: Learning Cubical Multiparameter Persistence Vectorizations',
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/novel differentiable vectorization layer/i)
    ).toBeInTheDocument();
  });

  it('renders the status banner for approval status', () => {
    renderComponent();
    expect(screen.getByText('Waiting for approval')).toBeInTheDocument();

    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('renders the identifiers and links', () => {
    renderComponent();
    const linkHeader = screen.getByRole('heading', {
      name: 'Identifiers & Links',
    });
    expect(linkHeader).toBeInTheDocument();
  });

  it('renders the Subject areas table with categories', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Subject areas' })
    ).toBeInTheDocument();

    expect(screen.getByText('Computing')).toBeInTheDocument();
  });

  it('renders the Submission box with acquisition source details', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'Submission' })
    ).toBeInTheDocument();

    expect(screen.getByText(/from/i)).toBeInTheDocument();
    expect(screen.getByText('arXiv')).toBeInTheDocument();
    expect(screen.getByText(/using/i)).toBeInTheDocument();
    expect(screen.getByText('hepcrawl')).toBeInTheDocument();
  });

  it('renders tickets via TicketsList', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'SNow information' })
    ).toBeInTheDocument();

    const t1 = screen.getByRole('link', { name: '#SNOW-123' });
    const t2 = screen.getByRole('link', { name: '#SNOW-456' });
    expect(t1).toBeInTheDocument();
    expect(t1).toHaveAttribute('href', 'https://snow/123');
    expect(t2).toBeInTheDocument();
    expect(t2).toHaveAttribute('href', 'https://snow/456');
  });

  it('shows the loading spinner when loading is true', () => {
    const store = getStore({
      backoffice: fromJS({
        loading: true,
      }),
    });

    renderWithProviders(<LiteratureDetailPageContainer />, {
      store,
      route: `${BACKOFFICE}/1`,
    });

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });
});
