import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'antd';
import Immutable from 'immutable';

import AggregationFilter from '../components/AggregationFilter';
import { forceArray } from '../utils';
import search from '../../actions/search';

const RANGE_AGGREATION_KEY = 'earliest_date';

class AggregationFiltersContainer extends Component {
  static isRange(aggregationKey) {
    return aggregationKey === RANGE_AGGREATION_KEY;
  }

  onAggregationChange(key, selections) {
    const isRange = AggregationFiltersContainer.isRange(key);
    let aggregations = selections;
    if (isRange && aggregations.length > 0) {
      aggregations = selections.join('--');
    }
    this.props.onAggregationChange(key, aggregations);
  }

  render() {
    return (
      <List>
        {this.props.aggregations.entrySeq().map(([aggregationKey, aggregation]) => (
          <List.Item key={aggregationKey}>
            <AggregationFilter
              range={aggregationKey === RANGE_AGGREATION_KEY}
              name={aggregationKey}
              buckets={aggregation.get('buckets')}
              selections={forceArray(this.props.query[aggregationKey])}
              onChange={
                (selections) => { this.onAggregationChange(aggregationKey, selections); }
              }
            />
          </List.Item>
        ))}
      </List>
    );
  }
}

AggregationFiltersContainer.propTypes = {
  onAggregationChange: PropTypes.func.isRequired,
  aggregations: PropTypes.instanceOf(Immutable.Map).isRequired,
  query: PropTypes.objectOf(PropTypes.any).isRequired,
};

const stateToProps = state => ({
  aggregations: state.search.get('aggregations'),
  query: state.router.location.query,
});

export const dispatchToProps = dispatch => ({
  onAggregationChange(aggregationKey, selections) {
    dispatch(search({ [aggregationKey]: selections }));
  },
});

export default connect(stateToProps, dispatchToProps)(AggregationFiltersContainer);
