import { connect, RootStateOrAny } from 'react-redux';

import CollectionsMenu from './CollectionsMenu';

const stateToProps = (state: RootStateOrAny) => ({
  currentPathname: state.router.location.pathname,
});

export default connect(stateToProps)(CollectionsMenu);
