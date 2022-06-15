import { connect } from 'react-redux';

import SearchScopeSelect from '../components/SearchScopeSelect';
import { changeSearchBoxNamespace } from '../../actions/search';

const stateToProps = (state: any) => ({
  searchScopeName: state.search.get('searchBoxNamespace')
});

export const dispatchToProps = (dispatch: any) => ({
  onSearchScopeChange(scope: any) {
    dispatch(changeSearchBoxNamespace(scope));
  }
});

// TODO: rename it SearchBoxNamespaceSelect (and the props)
export default connect(stateToProps, dispatchToProps)(SearchScopeSelect);
