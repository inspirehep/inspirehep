import { connect } from 'react-redux';

import SearchResults from '../components/SearchResults';
import { castPropToNumber } from '../utils';

const stateToProps = (state, { namespace }) => ({
  results: state.search.getIn(['namespaces', namespace, 'results']),
  page: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'page'])
  ),
  pageSize: castPropToNumber(
    state.search.getIn(['namespaces', namespace, 'query', 'size'])
  ),
});

export default connect(stateToProps)(SearchResults);
