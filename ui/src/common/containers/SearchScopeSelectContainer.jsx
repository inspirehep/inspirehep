import { connect } from 'react-redux';

import SearchScopeSelect from '../components/SearchScopeSelect';
import { changeSearchBoxNamespace } from '../../actions/search';

const stateToProps = state => ({
  searchScopeName: state.search.get('searchBoxNamespace'),
});

export const dispatchToProps = dispatch => ({
  onSearchScopeChange(scope) {
    dispatch(changeSearchBoxNamespace(scope));
  },
});

// TODO: rename it SearchBoxNamespaceSelect (and the props)
export default connect(stateToProps, dispatchToProps)(SearchScopeSelect);
