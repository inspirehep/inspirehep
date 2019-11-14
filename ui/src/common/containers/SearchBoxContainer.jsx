import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import { searchQueryUpdate } from '../../actions/search';

const stateToProps = state => ({
  value: state.search.getIn([
    'namespaces',
    state.search.get('searchBoxNamespace'),
    'query',
    'q',
  ]),
  namespace: state.search.get('searchBoxNamespace'),
});

export const dispatchToProps = dispatch => ({
  onSearch(namespace, value) {
    dispatch(searchQueryUpdate(namespace, { q: value }));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchBox);
