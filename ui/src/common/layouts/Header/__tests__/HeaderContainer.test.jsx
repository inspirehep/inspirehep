import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../../fixtures/store';
import HeaderContainer from '../HeaderContainer';
import { SUBMISSIONS, HOME } from '../../../routes';

describe('HeaderContainer', () => {
  it('passes props from state when submissions page', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: `${SUBMISSIONS}/page`,
        },
      },
    });
    const { queryByText, queryByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <HeaderContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(queryByTestId('searchbox')).toBeNull();
    expect(queryByText('Beta')).toBeNull();
  });

  it('passes props from state when home page', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: `${HOME}`,
        },
      },
    });
    const { queryByText, queryByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <HeaderContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(queryByTestId('searchbox')).toBeNull();
    expect(queryByText('Beta')).toBeNull();
  });
});
