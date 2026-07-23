import { pluralizeUnlessSingle } from '../utils';
import FormattedNumber from './FormattedNumber';

const NumberOfResults = ({ numberOfResults }: { numberOfResults: number }) => (
  <span data-testid="number-of-results">
    <FormattedNumber>{numberOfResults}</FormattedNumber>{' '}
    {pluralizeUnlessSingle('result', numberOfResults)}
  </span>
);

export default NumberOfResults;
