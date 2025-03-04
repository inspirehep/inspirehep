import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { searchQueryUpdate } from '../../actions/search';
import AggregationFilters from '../components/AggregationFilters';
import { convertSomeImmutablePropsToJS } from '../immutableToJS';

const stateToProps = (
  state: RootStateOrAny,
  { namespace }: { namespace: string }
) => ({
  state: state.search.getIn(['namespaces', namespace]).toJS(),
  aggregations: state.search.getIn(['namespaces', namespace, 'aggregations']),
  initialAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'initialAggregations',
  ]),
  query: state.search.getIn(['namespaces', namespace, 'query']),
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total']),
  namespace,
});

export const dispatchToProps = (
  dispatch: ActionCreator<Action>,
  { namespace }: { namespace: string }
) => ({
  onAggregationChange(aggregationKey: string, selections: any) {
    dispatch(
      searchQueryUpdate(namespace, { [aggregationKey]: selections, page: '1' })
    );
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(
  // @ts-ignore
  convertSomeImmutablePropsToJS(AggregationFilters, ['query'])
);
