import { connect } from 'react-redux';

import { setPreferredCiteFormat } from '../../actions/user';
import CiteModalAction from '../components/CiteModalAction';

const stateToProps = state => ({
  initialCiteFormat: state.user.get('preferredCiteFormat'),
});

export const dispatchToProps = dispatch => ({
  onCiteFormatChange(format) {
    dispatch(setPreferredCiteFormat(format));
  },
});

export default connect(stateToProps, dispatchToProps)(CiteModalAction);
