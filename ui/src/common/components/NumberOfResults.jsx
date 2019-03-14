import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NumberOfResults extends Component {
  render() {
    const { numberOfResults } = this.props;
    return (
      <span>
        {numberOfResults} {numberOfResults === 1 ? 'result' : 'results'}
      </span>
    );
  }
}

NumberOfResults.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
};

export default NumberOfResults;
