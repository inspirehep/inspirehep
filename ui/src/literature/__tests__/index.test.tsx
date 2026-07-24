import { waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';

import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Literature from '..';
import { LITERATURE } from '../../common/routes';

const renderLiterature = (route: string, initialState?: any) =>
  renderWithProviders(
    <Routes>
      <Route path={`${LITERATURE}/*`} element={<Literature />} />
    </Routes>,
    { initialState, route }
  );

describe('Literature', () => {
  it('navigates to SearchPageContainer when /literature', async () => {
    const { asFragment } = renderLiterature('/literature');

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('navigates to DetailPageContainer when /literature/:id', async () => {
    const { asFragment } = renderLiterature('/literature/1787272');

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('navigates to ReferenceDiffInterfaceContainer when /literature/:id/diff/:old..:new', async () => {
    const initialState = {
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    };

    const { asFragment } = renderLiterature(
      '/literature/1787272/diff/1..2',
      initialState
    );

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('does not navigate to ReferenceDiffInterfaceContainer when user is not authorised', async () => {
    const initialState = {
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['user'],
        },
      }),
    };

    const { asFragment } = renderLiterature(
      '/literature/1787272/diff/1..2',
      initialState
    );

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});
