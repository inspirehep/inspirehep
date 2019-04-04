import { connect } from 'react-redux';

import SearchResults from '../components/SearchResults';
import { castPropToNumber } from '../utils';

const stateToProps = state => ({
  results: state.search.get('results'),
  page: castPropToNumber(state.router.location.query.page),
  pageSize: castPropToNumber(state.router.location.query.size),
});

export default connect(stateToProps)(SearchResults);
