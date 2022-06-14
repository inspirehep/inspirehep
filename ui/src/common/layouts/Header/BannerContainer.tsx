import { connect } from 'react-redux';

import Banner from './Banner';
import { closeBanner } from '../../../actions/ui';

const stateToProps = state => ({
  closedBannersById: state.ui.get('closedBannersById'),
  currentPathname: state.router.location.pathname,
});

const dispatchToProps = dispatch => ({
  onClose(id) {
    dispatch(closeBanner(id));
  },
});

export default connect(stateToProps, dispatchToProps)(Banner);
