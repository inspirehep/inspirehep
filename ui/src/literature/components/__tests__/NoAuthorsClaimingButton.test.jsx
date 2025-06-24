import React from 'react';
import { render } from '@testing-library/react';

import NoAuthorsClaimingButton from '../NoAuthorsClaimingButton';

describe('NoAuthorsClaimingButton', () => {
  it('renders', () => {
    const { asFragment } = render(<NoAuthorsClaimingButton />);
    expect(asFragment()).toMatchSnapshot();
  });
});
