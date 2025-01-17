import React from 'react';
import { render } from '@testing-library/react';
import RorLink from '../RorLink';

describe('RorLink', () => {
  it('renders', () => {
    const ror = 'https://ror123.org';
    const { asFragment } = render(<RorLink ror={ror} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
