import { connect } from 'react-redux';
import { changeGuideModalVisibility } from '../../actions/ui';
import LinkLikeButton from '../components/LinkLikeButton';

export const dispatchToProps = (dispatch: any) => ({
  onClick() {
    dispatch(changeGuideModalVisibility(true));
  }
});

export default connect(null, dispatchToProps)(LinkLikeButton);
