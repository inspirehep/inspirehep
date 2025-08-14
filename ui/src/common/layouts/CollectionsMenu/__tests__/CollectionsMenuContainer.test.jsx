import React from 'react';
import { renderWithProviders } from '../../../../fixtures/render';
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

    const { getByTestId } = renderWithProviders(
      <CollectionsMenuContainer onHeightChange={jest.fn()} />,
      { store }
    );

    const collectionsMenu = getByTestId('collections-menu');
    expect(collectionsMenu).toBeInTheDocument();
  });
});
