import { connect, MapDispatchToPropsParam } from 'react-redux';
import { Map } from 'immutable';

import {
  setAssignLiteratureItemDrawerVisibility,
  assignLiteratureItemNoNameMatch,
} from '../../actions/literature';
import AssignLiteratureItemDrawer from '../components/AssignLiteratureItemDrawer';

interface RootState {
  user: {
    getIn: (values: [string, string]) => string;
  };
  literature: {
    get: (value: string) => number | Map<string, string>[];
  };
}

const stateToProps = (state: RootState) => ({
  authors: state.literature.get('allAuthors') as Map<string, string>[],
  literatureId: state.literature.get(
    'assignLiteratureItemDrawerVisible'
  ) as number,
  currentUserRecordId: Number(state.user.getIn(['data', 'recid'])),
});

export const dispatchToProps = (
  dispatch: MapDispatchToPropsParam<any, any>
) => ({
  onDrawerClose() {
    dispatch(setAssignLiteratureItemDrawerVisibility(null));
  },

  onAssign({
    from,
    to,
    literatureId,
  }: {
    from: number | undefined;
    to: number;
    literatureId: number;
  }) {
    dispatch(assignLiteratureItemNoNameMatch({ from, to, literatureId }));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(AssignLiteratureItemDrawer);
