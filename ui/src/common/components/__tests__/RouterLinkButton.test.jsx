import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RouterLinkButton from '../RouterLinkButton';

describe('RouterLinkButton', () => {
  it('renders with className', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <RouterLinkButton className="test" to="/test">
          Test
        </RouterLinkButton>
      </MemoryRouter>
    );
    expect(getByRole('link')).toHaveClass('test');
  });

  it('renders without className', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <RouterLinkButton to="/test">Test</RouterLinkButton>
      </MemoryRouter>
    );
    expect(getByRole('link')).toHaveAttribute('href', '/test');
  });
});
