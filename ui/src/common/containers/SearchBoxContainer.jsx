import { connect } from 'react-redux';

import toJS from '../immutableToJS';
import SearchBox from '../components/SearchBox';
import search from '../../actions/search';

const stateToProps = state => ({
  defaultValue: state.router.location.query.q,
});

export const dispatchToProps = dispatch => ({
  onSearch(value) {
    dispatch(search({ q: value }));
  },
});

export default connect(stateToProps, dispatchToProps)(toJS(SearchBox));
