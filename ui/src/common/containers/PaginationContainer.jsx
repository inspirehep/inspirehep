import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import { castPropToNumber } from '../utils';
import SearchPagination from '../components/SearchPagination';

const stateToProps = (state, { namespace }) => ({
  page: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'page'])
  ),
  pageSize: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'size'])
  ),
  total: state.search.getIn(['namespaces', namespace, 'total']),
});

export const dispatchToProps = (dispatch, { namespace }) => ({
  onPageChange(page) {
    window.scrollTo({ top: 0 });
    dispatch(searchQueryUpdate(namespace, { page: String(page) }));
  },

  onSizeChange(page, size) {
    window.scrollTo({ top: 0 });
    dispatch(searchQueryUpdate(namespace, { size, page: '1' }));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchPagination);
