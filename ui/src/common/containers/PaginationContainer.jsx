import { connect } from 'react-redux';

import { pushQueryToLocation } from '../../actions/search';
import { castPropToNumber } from '../utils';
import SearchPagination from '../components/SearchPagination';

const stateToProps = state => ({
  page: castPropToNumber(state.router.location.query.page),
  pageSize: castPropToNumber(state.router.location.query.size),
  total: state.search.get('total'),
});

export const dispatchToProps = dispatch => ({
  onPageChange(page) {
    dispatch(pushQueryToLocation({ page }));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchPagination);
