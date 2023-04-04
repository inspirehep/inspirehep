import React from 'react';

import ReactLatex from 'react-latex-next';
import 'katex/dist/katex.min.css';

const Latex = ({ children }: { children: any }) =>
  children && <ReactLatex>{children}</ReactLatex>;

Latex.defaultProps = {
  children: null,
};

export default Latex;
