import { waitFor } from '@testing-library/react';

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
});
