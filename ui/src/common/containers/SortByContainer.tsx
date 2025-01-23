import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { searchQueryUpdate } from '../../actions/search';

import SortBy from '../components/SortBy';
import { convertAllImmutablePropsToJS } from '../immutableToJS';

const stateToProps = (
  state: RootStateOrAny,
  { namespace }: { namespace: string }
) => ({
  sort: state.search.getIn(['namespaces', namespace, 'query', 'sort']),
  sortOptions: state.search.getIn(['namespaces', namespace, 'sortOptions']),
});

export const dispatchToProps = (
  dispatch: ActionCreator<Action>,
  { namespace }: { namespace: string }
) => ({
  onSortChange(sort: boolean) {
    dispatch(searchQueryUpdate(namespace, { sort, page: '1' }));
  },
});

const SortByContainer = connect(
  stateToProps,
  dispatchToProps
)(convertAllImmutablePropsToJS(SortBy));
SortByContainer.displayName = 'SortByContainer';

export default SortByContainer;
