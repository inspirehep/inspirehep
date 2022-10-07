import { connect, RootStateOrAny } from 'react-redux';

import SearchBoxNamespaceSelect from '../components/SearchBoxNamespaceSelect';
import { changeSearchBoxNamespace } from '../../actions/search';
import { Dispatch } from 'redux';

const stateToProps = (state: RootStateOrAny) => ({
  searchScopeName: state.search.get('searchBoxNamespace'),
});

export const dispatchToProps = (dispatch: Dispatch) => ({
  onSearchScopeChange(scope: string) {
    dispatch(changeSearchBoxNamespace(scope));
  },
});

// TODO: rename it SearchBoxNamespaceSelect (and the props)
export default connect(stateToProps, dispatchToProps)(SearchBoxNamespaceSelect);
