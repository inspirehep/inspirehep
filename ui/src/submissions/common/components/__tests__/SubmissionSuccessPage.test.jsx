import React from 'react';
import { render } from '@testing-library/react';

import SubmissionSuccessPage from '../SubmissionSuccessPage';

describe('SubmissionSuccessPage', () => {
  it('renders', () => {
    const { asFragment } = render(<SubmissionSuccessPage />);

    expect(asFragment()).toMatchSnapshot();
  });
});
