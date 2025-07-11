import React from 'react';
import { render } from '@testing-library/react';

import PartialAbstract from '../PartialAbstract';

describe('PartialAbstract', () => {
  it('should render partial abstract', () => {
    const abstract =
      'The phenomenon of CP violation is crucial to understand the asymmetry between matter and antimatter that exists in the Universe. Dramatic experimental progress has been made, in particular in measurements of the behaviour of particles containing the b quark, where CP violation effects are predicted by the Kobayashi-Maskawa mechanism that is embedded in the Standard Model. The status of these measurements and future prospects for an understanding of CP violation beyond the Standard Model are reviewed.';
    const { asFragment } = render(<PartialAbstract abstract={abstract} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render if abstract is not passed', () => {
    const { asFragment } = render(<PartialAbstract />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should not append ellipsis when abstract length is less than the limit', () => {
    const abstract = 'A short abstract';
    const { asFragment } = render(<PartialAbstract abstract={abstract} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
