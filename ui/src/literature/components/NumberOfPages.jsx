import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NumberOfPages extends Component {
  render() {
    const { numberOfPages } = this.props;

    return (
      numberOfPages && (
        <span>
          {numberOfPages} {numberOfPages === 1 ? 'page' : 'pages'}
        </span>
      )
    );
  }
}

NumberOfPages.propTypes = {
  numberOfPages: PropTypes.number,
};

NumberOfPages.defaultProps = {
  numberOfPages: null,
};

export default NumberOfPages;
