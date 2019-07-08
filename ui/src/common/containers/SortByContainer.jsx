import { connect } from 'react-redux';
import { pushQueryToLocation } from '../../actions/search';

import SortBy from '../components/SortBy';
import { convertAllImmutablePropsToJS } from '../immutableToJS';

const stateToProps = state => ({
  sort:
    state.router.location.query.sort ||
    state.search.getIn(['scope', 'query', 'sort']),
  sortOptions: state.search.get('sortOptions'),
});

export const dispatchToProps = dispatch => ({
  onSortChange(sort) {
    dispatch(pushQueryToLocation({ sort, page: 1 }));
  },
});

const SortByContainer = connect(stateToProps, dispatchToProps)(
  convertAllImmutablePropsToJS(SortBy)
);
SortByContainer.displayName = 'SortByContainer';

export default SortByContainer;
