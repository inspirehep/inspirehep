import React from 'react';
import { render } from '@testing-library/react';

import HiddenCollectionAlert from '../LiteratureCollectionBanner';

describe('HiddenCollectionAlert', () => {
  it('renders alert', () => {
    const { asFragment } = render(<HiddenCollectionAlert hiddenCollection />);
    expect(asFragment()).toMatchSnapshot();
  });
});
