import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AuthorBAI from '../AuthorBAI';

describe('AuthorBAI', () => {
  it('renders', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <AuthorBAI bai="F.Marchetto.1" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
