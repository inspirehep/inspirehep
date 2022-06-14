import React, { Component } from 'react';

import ReactLatex from 'react-latex-next';
import 'katex/dist/katex.min.css';

type OwnProps = {};

type Props = OwnProps & typeof Latex.defaultProps;

class Latex extends Component<Props> {

static defaultProps = {
    children: null,
};

  render() {
    const { children } = this.props;
    return children && <ReactLatex>{children}</ReactLatex>;
  }
}

export default Latex;
