import React from 'react';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from '../../common/components/FormattedNumber.tsx';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';

function getFormattedNumberOfSelectedOrNull(numberOfSelected: $TSFixMe) {
  if (numberOfSelected === 0) {
    return null;
  }
  return (
    <>
      <FormattedNumber>{numberOfSelected}</FormattedNumber> of{' '}
    </>
  );
}

type Props = {
    namespace: string;
    numberOfSelected?: number;
};

function NumberOfResults({ namespace, numberOfSelected }: Props) {
  return (
    <span>
      {!!numberOfSelected && getFormattedNumberOfSelectedOrNull(numberOfSelected)}
      <NumberOfResultsContainer namespace={namespace} />
    </span>
  );
}

export default NumberOfResults;
