import { connect } from 'react-redux';

import toJS from '../immutableToJS';
import SearchBox from '../components/SearchBox';
import search from '../../actions/search';

const dispatchToProps = dispatch => ({
  onSearch(query) {
    dispatch(search(query));
  },
});

export default connect(null, dispatchToProps)(toJS(SearchBox));
