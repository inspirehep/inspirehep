// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { searchQueryUpdate } from '../../actions/search';

import SortBy from '../components/SortBy';
import { convertAllImmutablePropsToJS } from '../immutableToJS';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: any
) => ({
  sort: state.search.getIn(['namespaces', namespace, 'query', 'sort']),
  sortOptions: state.search.getIn(['namespaces', namespace, 'sortOptions'])
});

export const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    namespace
  }: any
) => ({
  onSortChange(sort: any) {
    dispatch(searchQueryUpdate(namespace, { sort, page: '1' }));
  }
});

const SortByContainer = connect(stateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(SortBy)
);
SortByContainer.displayName = 'SortByContainer';

export default SortByContainer;
