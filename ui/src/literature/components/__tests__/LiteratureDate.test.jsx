import React from 'react';
import { render } from '@testing-library/react';

import LiteratureDate from '../../../common/components/LiteratureDate';

describe('LiteratureDate', () => {
  it('renders with date', () => {
    const { asFragment } = render(<LiteratureDate date="1993-06-07" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
