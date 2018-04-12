import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import search from '../../actions/search';

const actionsToProps = dispatch => ({
  onSearch(query) {
    dispatch(search(query));
  },
});

export default connect(null, actionsToProps)(SearchBox);

