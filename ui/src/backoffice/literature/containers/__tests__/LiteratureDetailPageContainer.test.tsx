import React from 'react';
import { fromJS } from 'immutable';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import LiteratureDetailPageContainer from '../LiteratureDetailPageContainer';
import { getStore } from '../../../../fixtures/store';
import { renderWithProviders } from '../../../../fixtures/render';
import { BACKOFFICE } from '../../../../common/routes';
import { Subject, WorkflowStatuses } from '../../../constants';
import {
  updateLiteratureAction,
  resolveLiteratureAction,
} from '../../../../actions/backoffice';
import { notifyActionError } from '../../../notifications';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-workflow-id' }),
}));

jest.mock('../../../../actions/backoffice', () => {
  const actual = jest.requireActual('../../../../actions/backoffice');
  return {
    ...actual,
    updateLiteratureAction: jest.fn(),
    resolveLiteratureAction: jest.fn(),
  };
});

jest.mock('../../../notifications', () => ({
  notifyActionError: jest.fn(),
  notifyActionSuccess: jest.fn(),
  notifyDeleteSuccess: jest.fn(),
  notifyDeleteError: jest.fn(),
  notifyLoginError: jest.fn(),
}));

describe('LiteratureDetailPageContainer', () => {
  const defaultInspireCategories = [
    { term: 'Computing', source: 'arxiv' },
    { term: 'Math and Math Physics', source: 'arxiv' },
    { term: 'Data Analysis and Statistics', source: 'arxiv' },
  ];

  const renderComponent = (
    status = WorkflowStatuses.APPROVAL,
    inspireCategories = defaultInspireCategories,
    subjectsDraft: { term: string; source: string }[] | null = null
  ) => {
    const store = getStore({
      backoffice: fromJS({
        loading: false,
        loggedIn: true,
        subjectsDraft,
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
            inspire_categories: inspireCategories,
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
            references: [
              {
                reference: {
                  authors: [{ full_name: 'Doe, J.' }],
                  misc: ['Extra info'],
                  publication_info: { year: 2001, artid: 'X42' },
                },
              },
            ],
          },
          form_data: {
            references: '[1] Raw reference text\n[2] Another raw reference',
          },
          matches: {
            exact: [3076804, 3143839],
          },
          status,
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

  it('renders raw references from form_data in the References section', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', { name: 'References' })
    ).toBeInTheDocument();
    expect(
      document.querySelector('.literature-references-raw')?.textContent
    ).toBe('[1] Raw reference text\n[2] Another raw reference');
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

  it('hides action buttons and shows message when completed', () => {
    renderComponent(WorkflowStatuses.COMPLETED);

    expect(
      screen.getByText('Workflow completed, no further actions available')
    ).toBeInTheDocument();
  });

  it('renders exact match callout for multiple exact matches status', () => {
    renderComponent(WorkflowStatuses.ERROR_MULTIPLE_EXACT_MATCHES);

    expect(screen.getByText('Multiple exact matches')).toBeInTheDocument();
    const duplicateIdsText = screen.getByText('3076804 or 3143839');
    expect(duplicateIdsText).toBeInTheDocument();
    expect(
      screen.getByText(
        'When you resolve this error, restart the workflow to continue'
      )
    ).toBeInTheDocument();
  });

  describe('Subject area', () => {
    beforeEach(() => {
      (updateLiteratureAction as jest.Mock).mockImplementation((...args) => ({
        type: 'updateLiteratureAction',
        payload: args,
      }));
      (resolveLiteratureAction as jest.Mock).mockImplementation((...args) => ({
        type: 'resolveLiteratureAction',
        payload: args,
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should save subjects on resolve if subjects have been updated but not saved', async () => {
      const user = userEvent.setup();
      const updatedSubjects = [
        { term: 'Math and Math Physics', source: 'arxiv' },
        { term: 'Data Analysis and Statistics', source: 'arxiv' },
      ];
      renderComponent(
        WorkflowStatuses.APPROVAL,
        defaultInspireCategories,
        updatedSubjects
      );

      await user.click(screen.getByRole('button', { name: /^accept$/i }));

      expect(updateLiteratureAction).toHaveBeenCalledWith(
        'test-workflow-id',
        expect.objectContaining({
          data: expect.objectContaining({
            inspire_categories: updatedSubjects,
          }),
        })
      );
      expect(resolveLiteratureAction).toHaveBeenCalledWith(
        'test-workflow-id',
        expect.objectContaining({ action: expect.anything() })
      );
    });

    it("shouldn't resolve workflow if subjects is empty", async () => {
      const user = userEvent.setup();
      const updatedSubjects: Subject[] = [];

      renderComponent(
        WorkflowStatuses.APPROVAL,
        defaultInspireCategories,
        updatedSubjects
      );

      await user.click(screen.getByRole('button', { name: /accept/i }));

      expect(notifyActionError).toHaveBeenCalledWith('Missing subjects field');
      expect(resolveLiteratureAction).not.toHaveBeenCalled();
    });
  });
});
