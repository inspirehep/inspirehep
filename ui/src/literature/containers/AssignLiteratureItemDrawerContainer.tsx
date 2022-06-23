import { connect, MapDispatchToPropsParam } from 'react-redux';

import {
  setAssignDetailViewDrawerVisibility,
  assignLiteratureItemNoNameMatch,
} from '../../actions/literature';
import AssignLiteratureItemDrawer from '../components/AssignLiteratureItemDrawer';

interface RootState {
  user: {
    getIn: (values: [string, string]) => string;
  };
  literature: {
    get: (value: string) => boolean;
  };
}

const stateToProps = (state: RootState) => ({
  visible: state.literature.get('isAssignDetailViewDrawerVisible'),
  currentUserRecordId: Number(state.user.getIn(['data', 'recid'])),
});

export const dispatchToProps = (
  dispatch: MapDispatchToPropsParam<any, any>
) => ({
  onDrawerClose() {
    dispatch(setAssignDetailViewDrawerVisibility(false));
  },

  onAssign({
    from,
    to,
    literatureId,
  }: {
    from: string | undefined;
    to: number;
    literatureId: string;
  }) {
    dispatch(assignLiteratureItemNoNameMatch({ from, to, literatureId }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignLiteratureItemDrawer);
