import { connect } from 'react-redux';
import { RootState } from '../../../types';

import CollectionsMenu from './CollectionsMenu';

const stateToProps = (state: RootState) => ({
  currentPathname: state.router.location.pathname,
});

export default connect(stateToProps)(CollectionsMenu);
