import React from 'react';

import { renderWithRouter } from '../../../fixtures/render';
import AuthorBAI from '../AuthorBAI';

describe('AuthorBAI', () => {
  it('renders', () => {
    const { asFragment } = renderWithRouter(<AuthorBAI bai="F.Marchetto.1" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
