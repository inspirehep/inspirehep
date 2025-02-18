import React from 'react';
import { render } from '@testing-library/react';
import Error404 from '../Error404';

describe('Error404', () => {
  it('renders Error404 with correct props', () => {
    const { asFragment } = render(<Error404 />);
    expect(asFragment()).toMatchSnapshot();
  });
});
