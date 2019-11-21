import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CheckboxAggregation from './CheckboxAggregation';
import RangeAggregation from './RangeAggregation';
import MultiSelectAggregation from './MultiSelectAggregation';
import DateRangeAggregation from './DateRangeAggregation';

class AggregationFilter extends Component {
  render() {
    const { aggregationType, ...aggregationProps } = this.props;
    switch (aggregationType) {
      case 'range':
        return <RangeAggregation {...aggregationProps} />;
      case 'date-range':
        return <DateRangeAggregation {...aggregationProps} />;
      case 'multiselect':
        return <MultiSelectAggregation {...aggregationProps} />;
      case 'checkbox':
      default:
        return <CheckboxAggregation {...aggregationProps} />;
    }
  }
}

AggregationFilter.propTypes = {
  aggregationType: PropTypes.oneOf([
    'range',
    'checkbox',
    'multiselect',
    'date-range',
  ]).isRequired,
};

export default AggregationFilter;
