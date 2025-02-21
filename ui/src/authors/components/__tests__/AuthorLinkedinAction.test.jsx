import React from 'react';
import { render } from '@testing-library/react';

import AuthorLinkedinAction from '../AuthorLinkedinAction';

describe('AuthorLinkedinAction', () => {
  it('renders with linkedin', () => {
    const { asFragment } = render(
      <AuthorLinkedinAction linkedin="harunurhan" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
