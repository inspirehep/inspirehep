import { connect } from 'react-redux';

import { setPreference } from '../../actions/user';
import CiteModalAction from '../components/CiteModalAction';
import { CITE_FORMAT_PREFERENCE } from '../../reducers/user';

const stateToProps = (state: any) => ({
  initialCiteFormat: state.user.getIn(['preferences', CITE_FORMAT_PREFERENCE])
});

export const dispatchToProps = (dispatch: any) => ({
  onCiteFormatChange(format: any) {
    dispatch(setPreference(CITE_FORMAT_PREFERENCE, format));
  }
});

export default connect(stateToProps, dispatchToProps)(CiteModalAction);
