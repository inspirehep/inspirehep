// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { changeGuideModalVisibility } from '../../actions/ui';
import LinkLikeButton from '../components/LinkLikeButton';

export const dispatchToProps = (dispatch: $TSFixMe) => ({
  onClick() {
    dispatch(changeGuideModalVisibility(true));
  }
});

export default connect(null, dispatchToProps)(LinkLikeButton);
