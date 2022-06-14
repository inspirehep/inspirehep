// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { setPreference } from '../../actions/user';
import CiteModalAction from '../components/CiteModalAction';
import { CITE_FORMAT_PREFERENCE } from '../../reducers/user';

const stateToProps = (state: $TSFixMe) => ({
  initialCiteFormat: state.user.getIn(['preferences', CITE_FORMAT_PREFERENCE])
});

export const dispatchToProps = (dispatch: $TSFixMe) => ({
  onCiteFormatChange(format: $TSFixMe) {
    dispatch(setPreference(CITE_FORMAT_PREFERENCE, format));
  }
});

export default connect(stateToProps, dispatchToProps)(CiteModalAction);
