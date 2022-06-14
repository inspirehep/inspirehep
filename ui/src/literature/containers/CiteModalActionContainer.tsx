import { connect } from 'react-redux';

import { setPreference } from '../../actions/user';
import CiteModalAction from '../components/CiteModalAction';
import { CITE_FORMAT_PREFERENCE } from '../../reducers/user';

const stateToProps = state => ({
  initialCiteFormat: state.user.getIn(['preferences', CITE_FORMAT_PREFERENCE]),
});

export const dispatchToProps = dispatch => ({
  onCiteFormatChange(format) {
    dispatch(setPreference(CITE_FORMAT_PREFERENCE, format));
  },
});

export default connect(stateToProps, dispatchToProps)(CiteModalAction);
