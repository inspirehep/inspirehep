import React from 'react';
import { render } from '@testing-library/react';

import VerticalDivider from '../VerticalDivider';

describe('VerticalDivider', () => {
  it('renders', () => {
    const { getByRole } = render(<VerticalDivider />);

    expect(getByRole('separator')).toBeInTheDocument();
  });
});
