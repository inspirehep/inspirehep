import { connect } from 'react-redux';
import { pushQueryToLocation } from '../../actions/search';

import SortBy from '../components/SortBy';

const stateToProps = state => ({
  sort: state.router.location.query.sort,
});

export const dispatchToProps = dispatch => ({
  onSortChange(sort) {
    dispatch(pushQueryToLocation({ sort }));
  },
});

export default connect(stateToProps, dispatchToProps)(SortBy);
