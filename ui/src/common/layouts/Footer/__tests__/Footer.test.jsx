import { render } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders when cataloger', () => {
    const { getByRole } = render(<Footer isCatalogerLoggedIn />);
    expect(getByRole('link', { name: 'Holdingpen' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Author list' })).toBeInTheDocument();
  });

  it('renders when not cataloger', () => {
    const { queryByRole } = render(<Footer isCatalogerLoggedIn={false} />);
    expect(queryByRole('link', { name: 'Holdingpen' })).not.toBeInTheDocument();
    expect(
      queryByRole('link', { name: 'Author list' })
    ).not.toBeInTheDocument();
  });
});
