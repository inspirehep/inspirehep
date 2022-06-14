import { connect } from 'react-redux';
import OrcidPushSetting from '../components/OrcidPushSetting';
import { updateOrcidPushSetting } from '../../actions/user';

const stateToProps = (state) => ({
  enabled: state.user.getIn(['data', 'allow_orcid_push']),
  isUpdating: state.user.get('isUpdatingOrcidPushSetting'),
});

const dispatchToProps = (dispatch) => ({
  onChange(value) {
    dispatch(updateOrcidPushSetting(value));
  },
});

export default connect(stateToProps, dispatchToProps)(OrcidPushSetting);
