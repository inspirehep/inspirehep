import React from 'react';
import { render } from '@testing-library/react';

import DOIMaterial from '../DOIMaterial';

describe('DOIMaterial', () => {
  it('renders with material', () => {
    const { asFragment } = render(<DOIMaterial material="myMaterial" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render without material', () => {
    const { asFragment } = render(<DOIMaterial />);
    expect(asFragment()).toMatchSnapshot();
  });
});
