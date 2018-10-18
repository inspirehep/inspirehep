import { connect } from 'react-redux';

import SearchResults from '../components/SearchResults';

const stateToProps = state => ({
  results: state.search.get('results'),
});

export default connect(stateToProps)(SearchResults);
