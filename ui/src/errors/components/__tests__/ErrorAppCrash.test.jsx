import React from 'react';
import { render } from '@testing-library/react';
import ErrorAppCrash from '../ErrorAppCrash';

describe('ErrorAppCrash', () => {
  it('renders ErrorAppCrash', () => {
    const { asFragment } = render(<ErrorAppCrash />);
    expect(asFragment()).toMatchSnapshot();
  });
});
