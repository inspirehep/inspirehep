// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import Banner from './Banner';
import { closeBanner } from '../../../actions/ui';

const stateToProps = (state: $TSFixMe) => ({
  closedBannersById: state.ui.get('closedBannersById'),
  currentPathname: state.router.location.pathname
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  onClose(id: $TSFixMe) {
    dispatch(closeBanner(id));
  }
});

export default connect(stateToProps, dispatchToProps)(Banner);
