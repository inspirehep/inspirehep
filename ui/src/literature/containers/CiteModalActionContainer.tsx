import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { setPreference } from '../../actions/user';
import CiteModalAction from '../components/CiteModalAction';
import { CITE_FORMAT_PREFERENCE } from '../../reducers/user';

const stateToProps = (state: RootStateOrAny) => ({
  initialCiteFormat: state.user.getIn(['preferences', CITE_FORMAT_PREFERENCE]),
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onCiteFormatChange(format: string) {
    dispatch(setPreference(CITE_FORMAT_PREFERENCE, format));
  },
});

export default connect(stateToProps, dispatchToProps)(CiteModalAction);
