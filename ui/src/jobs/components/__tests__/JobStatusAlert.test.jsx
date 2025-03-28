import { render } from '@testing-library/react';
import JobStatusAlert from '../JobStatusAlert';

describe('JobStatusAlert', () => {
  it('does not render with status open', () => {
    const { container } = render(<JobStatusAlert status="open" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders alert with status pending and correct type and message', () => {
    const { getByText } = render(<JobStatusAlert status="pending" />);
    expect(getByText('This job is pending!')).toBeInTheDocument();
  });

  it('renders alert with status closed and correct type and message', () => {
    const { getByText } = render(<JobStatusAlert status="closed" />);
    expect(getByText('This job is closed!')).toBeInTheDocument();
  });
});
