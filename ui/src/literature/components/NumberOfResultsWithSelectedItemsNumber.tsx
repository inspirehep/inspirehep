import React from 'react';
import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from '../../common/components/FormattedNumber.tsx';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';

function getFormattedNumberOfSelectedOrNull(numberOfSelected: any) {
  if (numberOfSelected === 0) {
    return null;
  }
  return (
    <>
      <FormattedNumber>{numberOfSelected}</FormattedNumber> of{' '}
    </>
  );
}

function NumberOfResults({
  namespace,
  numberOfSelected
}: any) {
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
