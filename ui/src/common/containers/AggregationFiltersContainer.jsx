import { connect } from 'react-redux';

import { pushQueryToLocation } from '../../actions/search';
import AggregationFilters from '../components/AggregationFilters';

const stateToProps = state => ({
  aggregations: state.search.get('aggregations'),
  initialAggregations: state.search.get('initialAggregations'),
  query: state.router.location.query,
  numberOfResults: state.search.get('total'),
});

export const dispatchToProps = dispatch => ({
  onAggregationChange(aggregationKey, selections) {
    dispatch(pushQueryToLocation({ [aggregationKey]: selections, page: 1 }));
  },
});

export default connect(stateToProps, dispatchToProps)(AggregationFilters);
