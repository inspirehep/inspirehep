import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pluralizeUnlessSingle from '../utils';

class NumberOfResults extends Component {
  render() {
    const { numberOfResults } = this.props;
    return (
      <span>
        {numberOfResults} {pluralizeUnlessSingle('result', numberOfResults)}
      </span>
    );
  }
}

NumberOfResults.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
};

export default NumberOfResults;
