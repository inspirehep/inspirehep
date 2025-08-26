import React from 'react';

import { renderWithProviders } from '../../../fixtures/render';
import AuthorBAI from '../AuthorBAI';

describe('AuthorBAI', () => {
  it('renders', () => {
    const { asFragment } = renderWithProviders(
      <AuthorBAI bai="F.Marchetto.1" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
