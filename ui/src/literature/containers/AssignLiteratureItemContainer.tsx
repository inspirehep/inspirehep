import { connect, MapDispatchToPropsParam } from 'react-redux';
import { checkNameCompatibility } from '../../actions/literature';
import AssignLiteratureItem from '../components/AssignLiteratureItem';

interface RootState {
  user: {
    getIn: (values: [string, string]) => void;
  };
}

export const stateToProps = (state: RootState) => ({
  currentUserRecordId: Number(state.user.getIn(['data', 'recid'])),
});

export const dispatchToProps = (
  dispatch: MapDispatchToPropsParam<any, any>
) => ({
  onAssign({ to, literatureId }: { to: number; literatureId: number }) {
    dispatch(checkNameCompatibility({ to, literatureId }));
  },
});

export default connect(stateToProps, dispatchToProps)(AssignLiteratureItem);
