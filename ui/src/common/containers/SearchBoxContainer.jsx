import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import { searchQueryUpdate } from '../../actions/search';
import { setHash } from '../../actions/router';
import { LITERATURE_NS } from '../../reducers/search';

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
    // HACK: This avoids carrying the hash to other searches when changing collection
    if (namespace !== LITERATURE_NS) {
      dispatch(setHash(''));
    }
    dispatch(searchQueryUpdate(namespace, { q: value }));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchBox);
