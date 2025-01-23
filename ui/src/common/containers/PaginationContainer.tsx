import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { searchQueryUpdate } from '../../actions/search';
import { castPropToNumber } from '../utils';
import SearchPagination from '../components/SearchPagination';

const stateToProps = (
  state: RootStateOrAny,
  { namespace }: { namespace: string }
) => ({
  page: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'page'])
  ),
  pageSize: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'size'])
  ),
  total: state.search.getIn(['namespaces', namespace, 'total']),
});

export const dispatchToProps = (
  dispatch: ActionCreator<Action>,
  { namespace }: { namespace: string }
) => ({
  onPageChange(page: number) {
    window.scrollTo(0, 0);
    dispatch(searchQueryUpdate(namespace, { page: String(page) }));
  },

  onSizeChange(_page: number, size: number) {
    window.scrollTo(0, 0);
    dispatch(searchQueryUpdate(namespace, { size, page: '1' }));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchPagination);
