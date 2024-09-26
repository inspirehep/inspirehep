import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { changeGuideModalVisibility } from '../../actions/ui';
import LinkLikeButton from '../components/LinkLikeButton/LinkLikeButton';

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onClick() {
    dispatch(changeGuideModalVisibility(true));
  },
});

export default connect(null, dispatchToProps)(LinkLikeButton);
