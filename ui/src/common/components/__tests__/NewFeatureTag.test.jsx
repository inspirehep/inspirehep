import { render } from '@testing-library/react';
import NewFeatureTag from '../NewFeatureTag';

describe('NewFeatureTag', () => {
  it('renders', () => {
    const { container, getByText } = render(<NewFeatureTag className="test" />);
    expect(getByText('New')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('test');
  });
});
