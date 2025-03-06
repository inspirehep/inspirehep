import React from 'react';

import { render } from '@testing-library/react';
import Loading from '../Loading';

describe('Loading', () => {
  it('render loading component', () => {
    const { getByText } = render(<Loading />);
    expect(getByText('Loading ...')).toBeInTheDocument();
  });
});
