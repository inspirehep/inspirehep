import React from 'react';
import { render } from '@testing-library/react';

import ClaimingDisabledButton from '../ClaimingDisabledButton';

describe('ClaimingDisabledButton', () => {
  it('renders', () => {
    const { asFragment } = render(<ClaimingDisabledButton />);
    expect(asFragment()).toMatchSnapshot();
  });
});
