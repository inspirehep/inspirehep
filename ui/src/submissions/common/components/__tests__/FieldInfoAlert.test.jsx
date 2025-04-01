import React from 'react';
import { render } from '@testing-library/react';

import FieldInfoAlert from '../FieldInfoAlert';

describe('FieldInfoAlert', () => {
  it('renders with alert description', () => {
    const { asFragment, getByText } = render(
      <FieldInfoAlert description={<span>Watch out for this field!</span>} />
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByText('Watch out for this field!')).toBeInTheDocument();
  });
});
