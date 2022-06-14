// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import OrcidPushSetting from '../components/OrcidPushSetting';
import { updateOrcidPushSetting } from '../../actions/user';

const stateToProps = (state: any) => ({
  enabled: state.user.getIn(['data', 'allow_orcid_push']),
  isUpdating: state.user.get('isUpdatingOrcidPushSetting')
});

const dispatchToProps = (dispatch: any) => ({
  onChange(value: any) {
    dispatch(updateOrcidPushSetting(value));
  }
});

export default connect(stateToProps, dispatchToProps)(OrcidPushSetting);
