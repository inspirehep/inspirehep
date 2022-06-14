// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import OrcidPushSettingMessage from '../components/OrcidPushSettingMessage';

export const stateToProps = (state: any) => {
  const userData = state.user.get('data');
  return {
    orcid: userData.get('orcid'),
    enabled: userData.get('allow_orcid_push'),
  };
};

export default connect(stateToProps)(OrcidPushSettingMessage);
