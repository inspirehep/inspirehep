import { connect } from 'react-redux';

import SearchResults from '../components/SearchResults';
import { castPropToNumber } from '../utils';

const stateToProps = state => ({
  results: state.search.get('results'),
  page: castPropToNumber(
    state.router.location.query.page ||
      state.search.getIn(['scope', 'query', 'page'])
  ),
  pageSize: castPropToNumber(
    state.router.location.query.size ||
      state.search.getIn(['scope', 'query', 'size'])
  ),
});

export default connect(stateToProps)(SearchResults);
