import { connect } from 'react-redux';

import GuideModal from '../components/GuideModal';
import { changeGuideModalVisibility } from '../../actions/ui';

const stateToProps = state => ({
  visible: state.ui.get('guideModalVisibility'),
});

export const dispatchToProps = dispatch => ({
  onCancel() {
    dispatch(changeGuideModalVisibility(false));
  },
});

export default connect(stateToProps, dispatchToProps)(GuideModal);
