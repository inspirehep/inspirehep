import React from 'react';
import { render } from '@testing-library/react';

import SubmissionSuccess from '../SubmissionSuccess';

describe('SubmissionSuccess', () => {
  it('renders with default message', () => {
    const { asFragment } = render(<SubmissionSuccess />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with custom message', () => {
    const { asFragment, getByText } = render(
      <SubmissionSuccess message={<strong>Custom Success</strong>} />
    );
    expect(asFragment).toMatchSnapshot();
    expect(getByText(/Custom Success/i)).toBeInTheDocument();
  });
});
