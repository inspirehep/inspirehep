// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import AggregationFilters from '../components/AggregationFilters';
import { convertSomeImmutablePropsToJS } from '../immutableToJS';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: $TSFixMe
) => ({
  aggregations: state.search.getIn(['namespaces', namespace, 'aggregations']),

  initialAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'initialAggregations',
  ]),

  query: state.search.getIn(['namespaces', namespace, 'query']),
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total'])
});

export const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    namespace
  }: $TSFixMe
) => ({
  onAggregationChange(aggregationKey: $TSFixMe, selections: $TSFixMe) {
    dispatch(
      searchQueryUpdate(namespace, { [aggregationKey]: selections, page: '1' })
    );
  }
});

export default connect(stateToProps, dispatchToProps)(
  convertSomeImmutablePropsToJS(AggregationFilters, ['query'])
);
