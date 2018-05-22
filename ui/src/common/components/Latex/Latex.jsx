import React, { Component } from 'react';
import PropTypes from 'prop-types';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import './Latex.scss';

class Latex extends Component {
  render() {
    const { children } = this.props;
    let latex;
    try {
      latex = children && katex.renderToString(`\\text{${children}}`);
    } catch (error) {
      latex = children;
    }
    return (
      // eslint-disable-next-line react/no-danger
      <span className="__Latex__" dangerouslySetInnerHTML={{ __html: latex }} />
    );
  }
}

Latex.propTypes = {
  children: PropTypes.node, // Only `string` node
};

Latex.defaultProps = {
  children: null,
};

export default Latex;
