import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../types';

import SearchBoxNamespaceSelect from '../components/SearchBoxNamespaceSelect';
import { changeSearchBoxNamespace } from '../../actions/search';

const stateToProps = (state: RootState) => ({
  searchScopeName: state.search.get('searchBoxNamespace'),
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onSearchScopeChange(scope: string) {
    dispatch(changeSearchBoxNamespace(scope));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchBoxNamespaceSelect);
