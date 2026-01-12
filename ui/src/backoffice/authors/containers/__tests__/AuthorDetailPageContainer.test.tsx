import React from 'react';
import { fromJS } from 'immutable';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { BACKOFFICE } from '../../../../common/routes';
import AuthorDetailPageContainer from '../AuthorDetailPageContainer';
import { getStore } from '../../../../fixtures/store';
import { renderWithProviders } from '../../../../fixtures/render';
import { BACKOFFICE_RESOLVE_ACTION_REQUEST } from '../../../../actions/actionTypes';
import { WorkflowStatuses } from '../../../constants';
import { WorkflowDecisions } from '../../../../common/constants';

describe('AuthorDetailPageContainer', (ids: any = []) => {
  const renderComponent = (ids: any = []) => {
    const store = getStore({
      backoffice: fromJS({
        loading: false,
        loggedIn: true,
        author: fromJS({
          data: {
            name: {
              value: 'Doe, John',
              preferred_name: 'Johnny',
              native_names: ['Name1', 'Name2'],
              name_variants: ['Name3', 'Name4'],
            },
            status: 'active',
            acquisition_source: {
              email: 'joao.ramiro@cern.ch',
              orcid: '0000-0002-6357-9297',
              method: 'submitter',
              source: 'submitter',
            },
            ids: [{ schema: 'ORCID', value: '0000-0002-6357-9297' }, ...ids],
          },
          status: WorkflowStatuses.APPROVAL,
          tickets: [
            { ticket_id: 'ticket1', ticket_url: 'www.ticket1.com' },
            { ticket_id: 'ticket2', ticket_url: 'www.ticket2.com' },
          ],
        }),
      }),
    });

    const renderedComponent = renderWithProviders(
      <AuthorDetailPageContainer />,
      {
        store,
        route: `${BACKOFFICE}/1`,
      }
    );

    return { renderedComponent, store };
  };

  it('should render the AuthorDetailPageContainer', () => {
    const { renderedComponent } = renderComponent();

    expect(renderedComponent.asFragment()).toMatchSnapshot();
  });

  it('should display ORCID link', () => {
    renderComponent();

    const link = screen.getByRole('link', { name: '0000-0002-6357-9297' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://orcid.org/0000-0002-6357-9297'
    );
  });

  it('should not contain a Identifiers section', () => {
    renderComponent();

    const linkHeader = screen.queryByRole('heading', {
      name: 'Identifiers & Links',
    });
    expect(linkHeader).toBeNull();
  });

  it('should contain a Identifiers section', () => {
    renderComponent([{ schema: 'INSPIRE BAI', value: 'A.Einstein.1' }]);

    const linkHeader = screen.getByRole('heading', {
      name: 'Identifiers & Links',
    });
    expect(linkHeader).toBeInTheDocument();
  });

  it('CERN ID, INSPIRE ID and INSPIRE BAI Ids are not links', () => {
    renderComponent([
      { schema: 'INSPIRE BAI', value: 'A.Einstein.1' },
      { schema: 'INSPIRE ID', value: 'INSPIRE-00679173' },
      { schema: 'CERN', value: 'CERN-830340' },
    ]);
    const inpireBai = screen.getByText('A.Einstein.1');
    const inspireId = screen.getByText('INSPIRE-00679173');
    const cernId = screen.getByText('CERN-830340');
    expect(inpireBai.tagName).toBe('SPAN');
    expect(inspireId.tagName).toBe('SPAN');
    expect(cernId.tagName).toBe('SPAN');
  });

  it('should display the author name', () => {
    renderComponent();

    expect(screen.getAllByText('Doe, John')[0]).toBeInTheDocument();
  });

  it('should display the preferred name', () => {
    renderComponent();

    expect(screen.getByText('Preferred name:')).toBeInTheDocument();
    expect(screen.getByText('Johnny')).toBeInTheDocument();
  });

  it('should display status if present', () => {
    renderComponent();

    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should display the "Accept" button if status is approval', () => {
    renderComponent();

    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  it('should call the dispatch function when "Restart workflow" button is clicked', async () => {
    const { store } = renderComponent();
    store.clearActions();
    const restartButton = screen.getByText('Restart workflow');

    await waitFor(() => fireEvent.click(restartButton));

    const actions = store.getActions();
    expect(actions).toEqual([
      { type: BACKOFFICE_RESOLVE_ACTION_REQUEST, payload: { type: 'restart' } },
    ]);
  });

  it('should show the loading spinner when loading is true', () => {
    const store = getStore({
      backoffice: fromJS({
        loading: true,
      }),
    });

    renderWithProviders(<AuthorDetailPageContainer />, {
      store,
      route: `${BACKOFFICE}/1`,
    });

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });

  it('should not show all the tickets', () => {
    renderComponent();

    expect(
      screen.getByRole('link', {
        name: '#ticket1',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: '#ticket2',
      })
    ).toBeInTheDocument();
  });
});

describe('AuthorDetailPageContainer - Name Fields and control number', () => {
  const renderComponent = (
    authorData: { [key: string]: any },
    decisions?: { [key: string]: any }[]
  ) => {
    const store = getStore({
      backoffice: fromJS({
        loading: false,
        loggedIn: true,
        author: fromJS({
          data: { ...authorData },
          status: WorkflowStatuses.APPROVAL,
          ...(decisions && { decisions: fromJS(decisions) }),
        }),
      }),
    });

    return renderWithProviders(<AuthorDetailPageContainer />, {
      store,
      route: `${BACKOFFICE}/1`,
    });
  };

  it('should only display name', () => {
    renderComponent({
      name: { value: 'Doe, John' },
    });
    expect(screen.getAllByText('Doe, John')[0]).toBeInTheDocument();
    expect(screen.queryByText('Preferred name:')).not.toBeInTheDocument();
    expect(screen.queryByText('Native names:')).not.toBeInTheDocument();
    expect(screen.queryByText('Name variants:')).not.toBeInTheDocument();
  });

  it('should not display missing preferred_name if its missing', () => {
    renderComponent({
      name: {
        value: 'Doe, John',
        native_names: ['Name1', 'Name2'],
        name_variants: ['Name3', 'Name4'],
      },
    });
    expect(screen.getAllByText('Doe, John')[0]).toBeInTheDocument();
    expect(screen.getByText('Native names:')).toBeInTheDocument();
    expect(screen.getByText('Name1; Name2')).toBeInTheDocument();
    expect(screen.getByText('Name variants:')).toBeInTheDocument();
    expect(screen.getByText('Name3; Name4')).toBeInTheDocument();
    expect(screen.queryByText('Preferred name:')).not.toBeInTheDocument();
  });

  it('should not display missing name_variants if its missing', () => {
    renderComponent({
      name: {
        value: 'Doe, John',
        native_names: ['Name1', 'Name2'],
        preferred_name: 'Name3',
      },
    });

    expect(screen.getAllByText('Doe, John')[0]).toBeInTheDocument();
    expect(screen.getByText('Native names:')).toBeInTheDocument();
    expect(screen.getByText('Name1; Name2')).toBeInTheDocument();
    expect(screen.getByText('Preferred name:')).toBeInTheDocument();
    expect(screen.getByText('Name3')).toBeInTheDocument();
    expect(screen.queryByText('Name variants:')).not.toBeInTheDocument();
  });

  it('should not display missing native_names if its missing', () => {
    renderComponent({
      name: {
        value: 'Doe, John',
        name_variants: ['Name1', 'Name2'],
        preferred_name: 'Name3',
      },
    });

    expect(screen.getAllByText('Doe, John')[0]).toBeInTheDocument();
    expect(screen.getByText('Name variants:')).toBeInTheDocument();
    expect(screen.getByText('Name1; Name2')).toBeInTheDocument();
    expect(screen.getByText('Preferred name:')).toBeInTheDocument();
    expect(screen.getByText('Name3')).toBeInTheDocument();
    expect(screen.queryByText('Native names:')).not.toBeInTheDocument();
  });

  it('should display all name fields if all are present', () => {
    renderComponent({
      name: {
        value: 'Doe, John',
        native_names: ['Name1', 'Name2'],
        preferred_name: 'Name3',
        name_variants: ['Name4', 'Name5'],
      },
    });

    expect(screen.getAllByText('Doe, John')[0]).toBeInTheDocument();
    expect(screen.getByText('Native names:')).toBeInTheDocument();
    expect(screen.getByText('Name1; Name2')).toBeInTheDocument();
    expect(screen.getByText('Preferred name:')).toBeInTheDocument();
    expect(screen.getByText('Name3')).toBeInTheDocument();
    expect(screen.getByText('Name variants:')).toBeInTheDocument();
    expect(screen.getByText('Name4; Name5')).toBeInTheDocument();
  });

  it('should render the text and link when controlNumber is provided', () => {
    const decisions = [
      {
        id: 32,
        workflow: '2381efdb-2720-435a-bb8f-d0d768b01ecc',
        action: WorkflowDecisions.ACCEPT,
        _created_at: '2025-01-13T08:53:43.383108Z',
        _updated_at: '2025-01-16T10:58:44.083627Z',
        user: 'john.doe@cern.ch',
      },
    ];

    renderComponent(
      {
        name: { value: 'Doe, John' },
        control_number: 12345,
      },
      decisions
    );

    expect(screen.getByText('as')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: '12345' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/authors/12345');
  });

  it('should not render the text and link when controlNumber is not provided', () => {
    renderComponent({
      name: { value: 'Doe, John' },
    });
    expect(screen.queryByText('as')).not.toBeInTheDocument();
  });
});
