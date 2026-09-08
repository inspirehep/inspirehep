import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../fixtures/render';
import { getStore } from '../../../../fixtures/store';
import Header from '../Header';

describe('Header', () => {
  it('renders with search box if it is not on home or submission', async () => {
    const { findByTestId } = renderWithProviders(
      <Header
        isSubmissionsPage={false}
        isHomePage={false}
        isBetaPage={false}
      />,
      { store: getStore() }
    );
    expect(await findByTestId('searchbox')).toBeInTheDocument();
  });

  it('renders without search box if it is on homepage `/`', async () => {
    const { queryByTestId } = renderWithProviders(
      <Header isSubmissionsPage={false} isHomePage isBetaPage={false} />,
      { store: getStore() }
    );
    await waitFor(() => expect(queryByTestId('searchbox')).toBeNull());
  });

  it('renders without search box if it is on submission page', async () => {
    const { queryByTestId } = renderWithProviders(
      <Header isSubmissionsPage isHomePage={false} isBetaPage={false} />,
      { store: getStore() }
    );
    await waitFor(() => expect(queryByTestId('searchbox')).toBeNull());
  });

  it('renders with Banner and Ribbon if it is on beta page', async () => {
    const { findByText } = renderWithProviders(
      <Header isSubmissionsPage={false} isHomePage={false} isBetaPage />,
      { store: getStore() }
    );
    expect(await findByText('Beta')).toBeInTheDocument();
  });
});
