import React from 'react';
import { render } from '@testing-library/react';

import GoBackLink from '../GoBackLink';

describe('GoBackLink', () => {
  it('renders with default children', () => {
    const { getByRole } = render(<GoBackLink onClick={jest.fn()} />);
    const button = getByRole('button', { name: /go back/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    const { getByRole } = render(
      <GoBackLink onClick={jest.fn()}>custom</GoBackLink>
    );
    const button = getByRole('button', { name: /custom/i });
    expect(button).toBeInTheDocument();
  });
});
