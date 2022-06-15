import { connect } from 'react-redux';

import Banner from './Banner';
import { closeBanner } from '../../../actions/ui';

const stateToProps = (state: any) => ({
  closedBannersById: state.ui.get('closedBannersById'),
  currentPathname: state.router.location.pathname
});

const dispatchToProps = (dispatch: any) => ({
  onClose(id: any) {
    dispatch(closeBanner(id));
  }
});

export default connect(stateToProps, dispatchToProps)(Banner);
