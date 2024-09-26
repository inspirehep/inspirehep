import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import {
  setCurateDrawerVisibility,
  curateReference,
} from '../../actions/literature';
import { searchResultsReset } from '../../actions/search';
import { CURATE_REFERENCE_NS } from '../../search/constants';
import CurateReferenceDrawer from '../components/CurateReferenceDrawer/CurateReferenceDrawer';

const stateToProps = (state: RootStateOrAny, { namespace }: { namespace: string }) => ({
  results: state.search.getIn(['namespaces', namespace, 'results']),
  referenceId: state.literature.get('referenceDrawer'),
  visible: state.literature.get('referenceDrawer') !== null,
  loading: state.search.getIn(['namespaces', CURATE_REFERENCE_NS, 'loading'])
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onDrawerClose() {
    dispatch(setCurateDrawerVisibility(null));
    dispatch(searchResultsReset(CURATE_REFERENCE_NS));
  },

  onCurate({
    recordId,
    recordUuid,
    revisionId,
    referenceId,
    newReferenceId,
  }: {
    recordId: number;
    recordUuid: string;
    revisionId: number;
    referenceId: number;
    newReferenceId: number;
  }) {
    dispatch(curateReference({recordId, recordUuid, revisionId, referenceId, newReferenceId}));
  },
});

export default connect(stateToProps, dispatchToProps)(CurateReferenceDrawer);
