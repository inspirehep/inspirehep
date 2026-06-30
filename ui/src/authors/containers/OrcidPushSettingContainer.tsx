import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../../types';

import OrcidPushSetting from '../components/OrcidPushSetting';
import { updateOrcidPushSetting } from '../../actions/user';

const stateToProps = (state: RootState) => ({
  enabled: state.user.getIn(['data', 'allow_orcid_push']),
  isUpdating: state.user.get('isUpdatingOrcidPushSetting'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onChange(value: boolean) {
    dispatch(updateOrcidPushSetting(value));
  },
});

export default connect(stateToProps, dispatchToProps)(OrcidPushSetting);
