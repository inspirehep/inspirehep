import React from 'react';
import { fromJS } from 'immutable';
import {
  fireEvent,
  prettyDOM,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { BACKOFFICE } from '../../../../common/routes';
import AuthorDetailPageContainer from '../AuthorDetailPageContainer';
import { getStore } from '../../../../fixtures/store';
import { BACKOFFICE_RESOLVE_ACTION_REQUEST } from '../../../../actions/actionTypes';
import backoffice from '../../..';

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
          status: 'approval',
        }),
      }),
    });

    const renderedComponent = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`${BACKOFFICE}/1`]}>
          <AuthorDetailPageContainer />
        </MemoryRouter>
      </Provider>
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

  it('should not contain a Links section', () => {
    renderComponent();

    const linkHeader = screen.queryByRole('heading', { name: 'Links' });
    expect(linkHeader).toBeNull();
  });

  it('should contain a Links section', () => {
    renderComponent([{ schema: 'INSPIRE BAI', value: 'A.Einstein.1' }]);

    const linkHeader = screen.getByRole('heading', { name: 'Links' });
    expect(linkHeader).toBeInTheDocument();
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

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`${BACKOFFICE}/1`]}>
          <AuthorDetailPageContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
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
          status: 'approval',
          ...(decisions && { decisions: fromJS(decisions) }),
        }),
      }),
    });

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`${BACKOFFICE}/1`]}>
          <AuthorDetailPageContainer />
        </MemoryRouter>
      </Provider>
    );
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
        action: 'accept',
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
