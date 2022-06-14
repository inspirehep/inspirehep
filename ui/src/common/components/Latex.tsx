import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ReactLatex from 'react-latex-next';
import 'katex/dist/katex.min.css';

class Latex extends Component {
  render() {
    const { children } = this.props;
    return children && <ReactLatex>{children}</ReactLatex>;
  }
}

Latex.propTypes = {
  children: PropTypes.node, // Only `string` node
};

Latex.defaultProps = {
  children: null,
};

export default Latex;
