import { connect } from 'react-redux';

import CollectionsMenu from './CollectionsMenu';

const stateToProps = (state: any) => ({
  currentPathname: state.router.location.pathname,
  currentHash: state.router.location.hash
});

export default connect(stateToProps)(CollectionsMenu);
