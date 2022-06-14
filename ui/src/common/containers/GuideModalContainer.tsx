// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import GuideModal from '../components/GuideModal';
import { changeGuideModalVisibility } from '../../actions/ui';

const stateToProps = (state: any) => ({
  visible: state.ui.get('guideModalVisibility')
});

export const dispatchToProps = (dispatch: any) => ({
  onCancel() {
    dispatch(changeGuideModalVisibility(false));
  }
});

export default connect(stateToProps, dispatchToProps)(GuideModal);
