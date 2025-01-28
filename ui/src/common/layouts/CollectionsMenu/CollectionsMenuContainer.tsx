import { connect, RootStateOrAny } from 'react-redux';

import CollectionsMenu from './CollectionsMenu';
import { isCataloger, isSuperUser } from '../../authorization';

const stateToProps = (state: RootStateOrAny) => {
  const isCatalogerLoggedIn = isCataloger(state.user.getIn(['data', 'roles']));
  const isSuperUserLoggedIn = isSuperUser(state.user.getIn(['data', 'roles']));
  return {
    canAccessDataCollection: isCatalogerLoggedIn || isSuperUserLoggedIn,
    currentPathname: state.router.location.pathname,
    currentHash: state.router.location.hash,
  };
};

export default connect(stateToProps)(CollectionsMenu);
