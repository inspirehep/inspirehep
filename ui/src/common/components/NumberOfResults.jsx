import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pluralizeUnlessSingle from '../utils';
import FormattedNumber from './FormattedNumber.tsx';

class NumberOfResults extends Component {
  render() {
    const { numberOfResults } = this.props;
    return (
      <span>
        <FormattedNumber>{numberOfResults}</FormattedNumber>{' '}
        {pluralizeUnlessSingle('result', numberOfResults)}
      </span>
    );
  }
}

NumberOfResults.propTypes = {
  numberOfResults: PropTypes.number.isRequired,
};

export default NumberOfResults;
