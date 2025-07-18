import { renderWithProviders } from '../../../../fixtures/render';
import { getStore } from '../../../../fixtures/store';
import Header from '../Header';

describe('Header', () => {
  it('renders with search box if it is not on home or submission', () => {
    const { getByTestId } = renderWithProviders(
      <Header
        isSubmissionsPage={false}
        isHomePage={false}
        isBetaPage={false}
      />,
      { store: getStore() }
    );
    expect(getByTestId('searchbox')).toBeInTheDocument();
  });

  it('renders without search box if it is on homepage `/`', () => {
    const { queryByTestId } = renderWithProviders(
      <Header isSubmissionsPage={false} isHomePage isBetaPage={false} />,
      { store: getStore() }
    );
    expect(queryByTestId('searchbox')).toBeNull();
  });

  it('renders without search box if it is on submission page', () => {
    const { queryByTestId } = renderWithProviders(
      <Header isSubmissionsPage isHomePage={false} isBetaPage={false} />,
      { store: getStore() }
    );
    expect(queryByTestId('searchbox')).toBeNull();
  });

  it('renders with Banner and Ribbon if it is on beta page', () => {
    const { getByText } = renderWithProviders(
      <Header isSubmissionsPage={false} isHomePage={false} isBetaPage />,
      { store: getStore() }
    );
    expect(getByText('Beta')).toBeInTheDocument();
  });
});
