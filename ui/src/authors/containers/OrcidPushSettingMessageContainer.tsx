import { connect } from 'react-redux';
import OrcidPushSettingMessage from '../components/OrcidPushSettingMessage';

export const stateToProps = (state) => {
  const userData = state.user.get('data');
  return {
    orcid: userData.get('orcid'),
    enabled: userData.get('allow_orcid_push'),
  };
};

export default connect(stateToProps)(OrcidPushSettingMessage);
