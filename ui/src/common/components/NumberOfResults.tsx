import React from 'react';
import { pluralizeUnlessSingle } from '../utils';
import FormattedNumber from './FormattedNumber';

const NumberOfResults = ({ numberOfResults }: { numberOfResults: number }) => (
  <span>
    <FormattedNumber>{numberOfResults}</FormattedNumber>{' '}
    {pluralizeUnlessSingle('result', numberOfResults)}
  </span>
);

export default NumberOfResults;
