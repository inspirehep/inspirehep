import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CheckboxAggregation from './CheckboxAggregation';
import RangeAggregation from './RangeAggregation';
import MultiSelectAggregation from './MultiSelectAggregation';
import TreeAggregation from './TreeAggregation';

class AggregationFilter extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'aggregationType' does not exist on type ... Remove this comment to see the full error message
    const { aggregationType, ...aggregationProps } = this.props;
    switch (aggregationType) {
      case 'range':
        // @ts-expect-error ts-migrate(2739) FIXME: Type '{ children?: ReactNode; }' is missing the fo... Remove this comment to see the full error message
        return <RangeAggregation {...aggregationProps} />;
      case 'multiselect':
        return <MultiSelectAggregation {...aggregationProps} />;
      case 'tree':
        // @ts-expect-error ts-migrate(2739) FIXME: Type '{ children?: ReactNode; }' is missing the fo... Remove this comment to see the full error message
        return <TreeAggregation {...aggregationProps} />;
      case 'checkbox':
      default:
        return <CheckboxAggregation {...aggregationProps} />;
    }
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AggregationFilter.propTypes = {
  aggregationType: PropTypes.oneOf(['range', 'checkbox', 'multiselect', 'tree'])
    .isRequired,
};

export default AggregationFilter;
