import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../fixtures/render';
import { getStore } from '../../../../fixtures/store';
import HeaderContainer from '../HeaderContainer';
import { SUBMISSIONS, HOME } from '../../../routes';

describe('HeaderContainer', () => {
  it('passes props from state when submissions page', async () => {
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

    await waitFor(() => expect(queryByTestId('searchbox')).toBeNull());
    expect(queryByText('Beta')).toBeNull();
  });

  it('passes props from state when home page', async () => {
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

    await waitFor(() => expect(queryByTestId('searchbox')).toBeNull());
    expect(queryByText('Beta')).toBeNull();
  });
});
