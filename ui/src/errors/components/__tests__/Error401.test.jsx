import React from 'react';
import { render } from '@testing-library/react';
import Error401 from '../Error401';

describe('Error401', () => {
  it('renders Error401 with correct props', () => {
    const { asFragment } = render(<Error401 />);
    expect(asFragment()).toMatchSnapshot();
  });
});
