import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import GuideModal from '../components/GuideModal';
import { changeGuideModalVisibility } from '../../actions/ui';

const stateToProps = (state: RootStateOrAny) => ({
  visible: state.ui.get('guideModalVisibility'),
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onCancel() {
    dispatch(changeGuideModalVisibility(false));
  },
});

export default connect(stateToProps, dispatchToProps)(GuideModal);
