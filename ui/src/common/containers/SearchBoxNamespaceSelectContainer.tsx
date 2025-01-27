import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import SearchBoxNamespaceSelect from '../components/SearchBoxNamespaceSelect';
import { changeSearchBoxNamespace } from '../../actions/search';
import { isCataloger, isSuperUser } from '../authorization';

const stateToProps = (state: RootStateOrAny) => {
  const isCatalogerLoggedIn = isCataloger(state.user.getIn(['data', 'roles']));
  const isSuperUserLoggedIn = isSuperUser(state.user.getIn(['data', 'roles']));
  return {
    searchScopeName: state.search.get('searchBoxNamespace'),
    canAccessDataCollection: isCatalogerLoggedIn || isSuperUserLoggedIn,
  };
};

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onSearchScopeChange(scope: string) {
    dispatch(changeSearchBoxNamespace(scope));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchBoxNamespaceSelect);
