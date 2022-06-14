import React, { Component } from 'react';
import pluralizeUnlessSingle from '../utils';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from './FormattedNumber.tsx';

type Props = {
    numberOfResults: number;
};

class NumberOfResults extends Component<Props> {

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

export default NumberOfResults;
