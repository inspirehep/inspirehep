import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import CheckboxAggregation from './CheckboxAggregation';
import RangeAggregation from './RangeAggregation';

class AggregationFilter extends Component {
  render() {
    const {
      buckets,
      onChange,
      name,
      range,
      selections,
    } = this.props;

    if (range) {
      return (
        <RangeAggregation
          name={name}
          buckets={buckets}
          onChange={onChange}
          selections={selections}
        />
      );
    } else {
      return (
        <CheckboxAggregation
          name={name}
          buckets={buckets}
          onChange={onChange}
          selections={selections}
        />
      );
    }
  }
}

AggregationFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  buckets: PropTypes.instanceOf(Immutable.List).isRequired,
  name: PropTypes.string.isRequired,
  selections: PropTypes.arrayOf(PropTypes.any),
  range: PropTypes.bool,
};

AggregationFilter.defaultProps = {
  range: false,
  selections: [],
};

export default AggregationFilter;
