import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import AssignDifferentProfileAction from '../components/AssignDifferentProfileAction';
import { assignDifferentProfile } from '../../actions/authors';

const stateToProps = (state: RootStateOrAny) => ({
  disabled: state.authors.get('publicationSelection').size === 0,
  currentUserId: Number(state.user.getIn(['data', 'recid'])),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onAssign({ from, to }: { from: string, to: string }) {
    dispatch(assignDifferentProfile({ from, to }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignDifferentProfileAction);
