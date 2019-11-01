import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import AggregationFilters from '../components/AggregationFilters';
import { convertSomeImmutablePropsToJS } from '../immutableToJS';

const stateToProps = (state, { namespace }) => ({
  aggregations: state.search.getIn(['namespaces', namespace, 'aggregations']),
  initialAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'initialAggregations',
  ]),
  query: state.search.getIn(['namespaces', namespace, 'query']),
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total']),
});

export const dispatchToProps = (dispatch, { namespace }) => ({
  onAggregationChange(aggregationKey, selections) {
    dispatch(
      searchQueryUpdate(namespace, { [aggregationKey]: selections, page: '1' })
    );
  },
});

export default connect(stateToProps, dispatchToProps)(
  convertSomeImmutablePropsToJS(AggregationFilters, ['query'])
);
