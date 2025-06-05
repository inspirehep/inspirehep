import { act } from 'react-dom/test-utils';
import { render } from '@testing-library/react';

import usePrevious from '../usePrevious';

// eslint-disable-next-line react/prop-types
function TestPrevious({ value }) {
  const previousValue = usePrevious(value);
  return (
    <span>
      Previous: {previousValue}, Current: {value}
    </span>
  );
}

describe('usePrevious', () => {
  it('renders previous and current value', () => {
    const { getByText, rerender } = render(<TestPrevious value={1} />);
    act(() => {
      rerender(<TestPrevious value={2} />);
    });

    expect(getByText('Previous: 1, Current: 2')).toBeInTheDocument();
  });
});
