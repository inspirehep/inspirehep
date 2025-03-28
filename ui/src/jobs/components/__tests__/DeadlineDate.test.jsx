import { render } from '@testing-library/react';
import DeadlineDate from '../DeadlineDate';

describe('DeadlineDate', () => {
  it('renders with deadlineDate', () => {
    const { getByText } = render(
      <DeadlineDate deadlineDate="2003-03-12T00:00:00+00:00" />
    );
    expect(getByText('Deadline on Mar 12, 2003')).toBeInTheDocument();
  });
});
