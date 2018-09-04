import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import { pushQueryToLocation } from '../../actions/search';

const stateToProps = state => ({
  value: state.router.location.query.q,
  searchScopeName: state.search.getIn(['scope', 'name']),
});

export const dispatchToProps = dispatch => ({
  onSearch(value) {
    dispatch(pushQueryToLocation({ q: value }, true));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchBox);
