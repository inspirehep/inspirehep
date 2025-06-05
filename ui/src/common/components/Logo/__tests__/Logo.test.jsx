import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Logo from '../Logo';

describe('Logo', () => {
  it('renders', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
