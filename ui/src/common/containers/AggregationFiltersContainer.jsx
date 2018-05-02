import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'antd';
import Immutable from 'immutable';

import AggregationFilter from '../components/AggregationFilter';
import { forceArray } from '../utils';
import search from '../../actions/search';

class AggregationFiltersContainer extends Component {
  render() {
    return (
      <List>
        {this.props.aggregations.entrySeq().map(([aggregationKey, aggregation]) => (
          <List.Item key={aggregationKey}>
            <AggregationFilter
              name={aggregationKey}
              buckets={aggregation.get('buckets')}
              selectedKeys={forceArray(this.props.query[aggregationKey])}
              onChange={
                (selections) => { this.props.onAggregationChange(aggregationKey, selections); }
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
