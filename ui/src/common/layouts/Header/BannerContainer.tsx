import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../../types';

import Banner from './Banner';
import { closeBanner } from '../../../actions/ui';

const stateToProps = (state: RootState) => ({
  closedBannersById: state.ui.get('closedBannersById'),
  currentPathname: state.router.location.pathname,
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onClose(id: string) {
    dispatch(closeBanner(id));
  },
});

export default connect(stateToProps, dispatchToProps)(Banner);
