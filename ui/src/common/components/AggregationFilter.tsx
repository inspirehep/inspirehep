import React, { Component } from 'react';

import CheckboxAggregation from './CheckboxAggregation';
import RangeAggregation from './RangeAggregation';
import MultiSelectAggregation from './MultiSelectAggregation';
import TreeAggregation from './TreeAggregation';

type Props = {
    aggregationType: 'range' | 'checkbox' | 'multiselect' | 'tree';
};

class AggregationFilter extends Component<Props> {

  render() {
    const { aggregationType, ...aggregationProps } = this.props;
    switch (aggregationType) {
      case 'range':
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children?: ReactNode; }' is not assignable... Remove this comment to see the full error message
        return <RangeAggregation {...aggregationProps} />;
      case 'multiselect':
        return <MultiSelectAggregation {...aggregationProps} />;
      case 'tree':
        // @ts-expect-error ts-migrate(2739) FIXME: Type '{ children?: ReactNode; }' is missing the fo... Remove this comment to see the full error message
        return <TreeAggregation {...aggregationProps} />;
      case 'checkbox':
      default:
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children?: ReactNode; }' is not assignable... Remove this comment to see the full error message
        return <CheckboxAggregation {...aggregationProps} />;
    }
  }
}

export default AggregationFilter;
