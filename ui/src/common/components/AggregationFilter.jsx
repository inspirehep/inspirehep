import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CheckboxAggregation from './CheckboxAggregation';
import RangeAggregation from './RangeAggregation';

class AggregationFilter extends Component {
  render() {
    const { range, ...aggregationProps } = this.props;

    return range ? (
      <RangeAggregation {...aggregationProps} />
    ) : (
      <CheckboxAggregation {...aggregationProps} />
    );
  }
}

AggregationFilter.propTypes = {
  range: PropTypes.bool,
};

AggregationFilter.defaultProps = {
  range: false,
};

export default AggregationFilter;
