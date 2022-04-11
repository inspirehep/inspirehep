import React from 'react';
import PropTypes from 'prop-types';
import FormattedNumber from '../../common/components/FormattedNumber.tsx';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';

function getFormattedNumberOfSelectedOrNull(numberOfSelected) {
  if (numberOfSelected === 0) {
    return null;
  }
  return (
    <>
      <FormattedNumber>{numberOfSelected}</FormattedNumber> of{' '}
    </>
  );
}

function NumberOfResults({ namespace, numberOfSelected}) {
  return (
    <span>
      {!!numberOfSelected && getFormattedNumberOfSelectedOrNull(numberOfSelected)}
      <NumberOfResultsContainer namespace={namespace} />
    </span>
  );
}

NumberOfResults.propTypes = {
  namespace: PropTypes.string.isRequired,
  numberOfSelected: PropTypes.number,
};

export default NumberOfResults;
