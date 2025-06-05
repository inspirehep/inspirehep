import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import { getStore } from '../../../../fixtures/store';
import CollectionsMenuContainer from '../CollectionsMenuContainer';
import { SUBMISSIONS_AUTHOR } from '../../../routes';

describe('CollectionsMenuContainer', () => {
  it('passes props from state', () => {
    const store = getStore({
      router: {
        location: {
          pathname: SUBMISSIONS_AUTHOR,
        },
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <CollectionsMenuContainer onHeightChange={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    const collectionsMenu = getByTestId('collections-menu');
    expect(collectionsMenu).toBeInTheDocument();
  });
});
