import { connect } from 'react-redux';
import { goBack } from 'connected-react-router';
import GoBackLink from '../components/GoBackLink';

export const dispatchToProps = dispatch => ({
  onClick() {
    dispatch(goBack());
  },
});

export default connect(null, dispatchToProps)(GoBackLink);
