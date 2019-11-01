import { connect } from 'react-redux';
import { searchQueryUpdate } from '../../actions/search';

import SortBy from '../components/SortBy';
import { convertAllImmutablePropsToJS } from '../immutableToJS';

const stateToProps = (state, { namespace }) => ({
  sort: state.search.getIn(['namespaces', namespace, 'query', 'sort']),
  sortOptions: state.search.getIn(['namespaces', namespace, 'sortOptions']),
});

export const dispatchToProps = (dispatch, { namespace }) => ({
  onSortChange(sort) {
    dispatch(searchQueryUpdate(namespace, { sort, page: '1' }));
  },
});

const SortByContainer = connect(stateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(SortBy)
);
SortByContainer.displayName = 'SortByContainer';

export default SortByContainer;
