import { waitFor } from '@testing-library/react';

import { renderWithProviders } from '../../fixtures/render';
import Literature from '..';

describe('Literature', () => {
  it('navigates to SearchPageContainer when /literature', async () => {
    const { asFragment } = renderWithProviders(<Literature />, {
      route: '/literature',
    });

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });

  it('navigates to DetailPageContainer when /literature/:id', async () => {
    const { asFragment } = renderWithProviders(<Literature />, {
      route: '/literature/1787272',
    });

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});
