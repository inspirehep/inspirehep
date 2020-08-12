import { connect } from 'react-redux';

import EmbeddedSearchBox from '../components/EmbeddedSearchBox';
import { searchQueryUpdate } from '../../actions/search';

const dispatchToProps = (dispatch, { namespace }) => ({
  onSearch(value) {
    dispatch(searchQueryUpdate(namespace, { q: value }));
  },
});

export default connect(null, dispatchToProps)(EmbeddedSearchBox);
