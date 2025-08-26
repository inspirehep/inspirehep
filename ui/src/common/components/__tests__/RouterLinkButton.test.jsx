import { renderWithRouter } from '../../../fixtures/render';
import RouterLinkButton from '../RouterLinkButton';

describe('RouterLinkButton', () => {
  it('renders with className', () => {
    const { getByRole } = renderWithRouter(
      <RouterLinkButton className="test" to="/test">
        Test
      </RouterLinkButton>
    );
    expect(getByRole('link')).toHaveClass('test');
  });

  it('renders without className', () => {
    const { getByRole } = renderWithRouter(
      <RouterLinkButton to="/test">Test</RouterLinkButton>
    );
    expect(getByRole('link')).toHaveAttribute('href', '/test');
  });
});
