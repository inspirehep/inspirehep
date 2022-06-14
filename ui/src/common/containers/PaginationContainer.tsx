// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import { castPropToNumber } from '../utils';
import SearchPagination from '../components/SearchPagination';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: any
) => ({
  page: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'page'])
  ),

  pageSize: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'size'])
  ),

  total: state.search.getIn(['namespaces', namespace, 'total'])
});

export const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    namespace
  }: any
) => ({
  onPageChange(page: any) {
    window.scrollTo(0, 0);
    dispatch(searchQueryUpdate(namespace, { page: String(page) }));
  },

  onSizeChange(page: any, size: any) {
    window.scrollTo(0, 0);
    dispatch(searchQueryUpdate(namespace, { size, page: '1' }));
  }
});

export default connect(stateToProps, dispatchToProps)(SearchPagination);
