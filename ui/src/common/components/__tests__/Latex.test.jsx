import { render } from '@testing-library/react';

import Latex from '../Latex';

describe('Latex', () => {
  it('renders only text', () => {
    const { getByText } = render(<Latex>This does not have latex in it</Latex>);
    expect(getByText('This does not have latex in it')).toBeInTheDocument();
  });

  it('renders text with LaTex in $...$', () => {
    const textWithLatex = 'ATLAS $B_{s} \\rightarrow \\mu^{+} \\mu^{-}$';
    const { queryByText } = render(<Latex>{textWithLatex}</Latex>);
    expect(
      queryByText('ATLAS $B_{s} \\rightarrow \\mu^{+} \\mu^{-}$')
    ).toBeNull();
  });

  it('renders text with broken LaTex by falling back raw text', () => {
    const textWithBrokenLatex = 'ATLAS $B_{{s}$';
    const { getByText } = render(<Latex>{textWithBrokenLatex}</Latex>);
    expect(getByText('ATLAS $B_{{s}$')).toBeInTheDocument();
  });

  it('renders whithout inner html', () => {
    const { container } = render(<Latex />);
    expect(container).toBeEmptyDOMElement();
  });
});
