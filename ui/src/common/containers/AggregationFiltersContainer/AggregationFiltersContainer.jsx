import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import AggregationFilter from '../../components/AggregationFilter';
import { forceArray, convertArrayToMap, selfOrInfinity } from '../../utils';
import search from '../../../actions/search';
import './AggregationFiltersContainer.scss';

const RANGE_AGGREATION_KEY = 'earliest_date';
const AGGREGATION_KEYS_ORDER = [
  'earliest_date',
  'author',
  'subject',
  'arxiv_categories',
  'experiment',
  'doc_type',
];
const AGGREGATIONS_KEYS_ORDER_MAP = convertArrayToMap(AGGREGATION_KEYS_ORDER);

class AggregationFiltersContainer extends Component {
  static isRange(aggregationKey) {
    return aggregationKey === RANGE_AGGREATION_KEY;
  }

  static compareAggregationEntries([key1], [key2]) {
    const order1 = selfOrInfinity(AGGREGATIONS_KEYS_ORDER_MAP[key1]);
    const order2 = selfOrInfinity(AGGREGATIONS_KEYS_ORDER_MAP[key2]);
    return order1 - order2;
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
      <div className="__AggregationFiltersContainer__ bg-white pa3">
        {this.props.aggregations
          .entrySeq()
          .filter(([, aggregation]) => aggregation.get('buckets').size > 0)
          .sort(AggregationFiltersContainer.compareAggregationEntries)
          .map(([aggregationKey, aggregation]) => (
            <div key={aggregationKey}>
              <AggregationFilter
                range={aggregationKey === RANGE_AGGREATION_KEY}
                name={aggregationKey}
                buckets={aggregation.get('buckets')}
                selections={forceArray(this.props.query[aggregationKey])}
                onChange={selections => {
                  this.onAggregationChange(aggregationKey, selections);
                }}
              />
            </div>
          ))}
      </div>
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

export default connect(stateToProps, dispatchToProps)(
  AggregationFiltersContainer
);
