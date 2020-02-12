import { connect } from 'react-redux';
import OrcidPushSettingMessage from '../components/OrcidPushSettingMessage';

export const stateToProps = state => {
  const authorData = state.authors.getIn(['data', 'metadata']);
  const userData = state.user.get('data');
  return {
    orcid: userData.get('orcid'),
    enabled: userData.get('allow_orcid_push'),
    authorBAI: authorData.get('bai'),
  };
};

export default connect(stateToProps)(OrcidPushSettingMessage);
