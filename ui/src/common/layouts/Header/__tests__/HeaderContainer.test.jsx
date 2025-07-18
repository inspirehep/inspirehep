import { renderWithProviders } from '../../../../fixtures/render';
import { getStore } from '../../../../fixtures/store';
import HeaderContainer from '../HeaderContainer';
import { SUBMISSIONS, HOME } from '../../../routes';

describe('HeaderContainer', () => {
  it('passes props from state when submissions page', () => {
    const store = getStore({
      router: {
        location: {
          pathname: `${SUBMISSIONS}/page`,
        },
      },
    });
    const { queryByText, queryByTestId } = renderWithProviders(
      <HeaderContainer />,
      { store }
    );

    expect(queryByTestId('searchbox')).toBeNull();
    expect(queryByText('Beta')).toBeNull();
  });

  it('passes props from state when home page', () => {
    const store = getStore({
      router: {
        location: {
          pathname: `${HOME}`,
        },
      },
    });
    const { queryByText, queryByTestId } = renderWithProviders(
      <HeaderContainer />,
      { store }
    );

    expect(queryByTestId('searchbox')).toBeNull();
    expect(queryByText('Beta')).toBeNull();
  });
});
