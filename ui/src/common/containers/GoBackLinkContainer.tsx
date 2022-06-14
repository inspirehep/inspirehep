// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { goBack } from 'connected-react-router';
import GoBackLink from '../components/GoBackLink';

export const dispatchToProps = (dispatch: any) => ({
  onClick() {
    dispatch(goBack());
  }
});

export default connect(null, dispatchToProps)(GoBackLink);
