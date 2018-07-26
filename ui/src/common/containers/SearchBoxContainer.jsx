import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import search from '../../actions/search';

const stateToProps = state => ({
  defaultValue: state.router.location.query.q,
  searchScopeName: state.search.getIn(['scope', 'name']),
});

export const dispatchToProps = dispatch => ({
  onSearch(value) {
    dispatch(search({ q: value }, true));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchBox);
