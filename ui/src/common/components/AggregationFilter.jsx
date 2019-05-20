import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CheckboxAggregation from './CheckboxAggregation';
import RangeAggregation from './RangeAggregation';

class AggregationFilter extends Component {
  render() {
    const { aggregationType, ...aggregationProps } = this.props;
    switch (aggregationType) {
      case 'range':
        return <RangeAggregation {...aggregationProps} />;
      case 'checkbox':
      default:
        return <CheckboxAggregation {...aggregationProps} />;
    }
  }
}

AggregationFilter.propTypes = {
  aggregationType: PropTypes.oneOf(['range', 'checkbox']).isRequired,
};

export default AggregationFilter;
