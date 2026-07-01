import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../types';

import GuideModal from '../components/GuideModal';
import { changeGuideModalVisibility } from '../../actions/ui';

const stateToProps = (state: RootState) => ({
  visible: state.ui.get('guideModalVisibility'),
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onCancel() {
    dispatch(changeGuideModalVisibility(false));
  },
});

export default connect(stateToProps, dispatchToProps)(GuideModal);
