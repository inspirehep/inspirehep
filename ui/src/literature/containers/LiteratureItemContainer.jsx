import { connect } from 'react-redux';

import LiteratureItem from '../components/LiteratureItem';

const stateToProps = (state) => ({
  loggedIn: state.user.get('loggedIn'),
  hasAuthorProfile:
    state.user.getIn(['data', 'profile_control_number']) !== null,
});

export default connect(stateToProps)(LiteratureItem);
