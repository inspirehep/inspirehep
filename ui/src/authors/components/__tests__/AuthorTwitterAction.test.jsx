import React from 'react';
import { render } from '@testing-library/react';

import AuthorTwitterAction from '../AuthorTwitterAction';

describe('AuthorTwitterAction', () => {
  it('renders with twitter', () => {
    const { asFragment } = render(<AuthorTwitterAction twitter="harunurhan" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
