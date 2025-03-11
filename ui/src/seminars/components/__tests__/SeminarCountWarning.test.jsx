import React from 'react';
import { render } from '@testing-library/react';
import SeminarCountWarning from '../SeminarCountWarning';

describe('SeminarCountWarning', () => {
  it('renders', () => {
    const { getByText } = render(<SeminarCountWarning />);
    expect(
      getByText(
        'Please note that the list of seminars is managed by users and INSPIRE makes no claims as to its completeness and accuracy.'
      )
    ).toBeInTheDocument();
  });
});
