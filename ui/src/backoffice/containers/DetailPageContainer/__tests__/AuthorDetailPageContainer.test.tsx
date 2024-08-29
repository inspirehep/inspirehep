import React from 'react';
import { fromJS } from 'immutable';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { BACKOFFICE } from '../../../../common/routes';
import AuthorDetailPageContainer from '../AuthorDetailPageContainer';
import { getStoreWithState } from '../../../../fixtures/store';
import { BACKOFFICE_RESOLVE_ACTION_REQUEST } from '../../../../actions/actionTypes';

describe('AuthorDetailPageContainer', () => {
  const store = getStoreWithState({
    backoffice: fromJS({
      loading: false,
      loggedIn: true,
      author: fromJS({
        data: {
          name: {
            value: 'Doe, John',
            preferred_name: 'Johnny',
          },
          status: 'active',
          acquisition_source: {
            email: 'joao.ramiro@cern.ch',
            orcid: '0000-0002-6357-9297',
            method: 'submitter',
            source: 'submitter',
          },
        },
        status: 'approval',
      }),
    }),
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`${BACKOFFICE}/1`]}>
          <AuthorDetailPageContainer />
        </MemoryRouter>
      </Provider>
    );

  it('should render the AuthorDetailPageContainer', () => {
    const { asFragment } = renderComponent();

    expect(asFragment()).toMatchSnapshot();
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
    renderComponent();

    const restartButton = screen.getByText('Restart workflow');

    store.clearActions();

    await waitFor(() => fireEvent.click(restartButton));

    const actions = store.getActions();
    expect(actions).toEqual([
      { type: BACKOFFICE_RESOLVE_ACTION_REQUEST, payload: { type: 'restart' } },
    ]);
  });

  it('should show the loading spinner when loading is true', () => {
    const store = getStoreWithState({
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
