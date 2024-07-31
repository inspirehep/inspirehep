import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import { importExternalLiterature } from '../../../actions/submissions';
import DataImporter from '../components/DataImporter';

const stateToProps = (state: RootStateOrAny) => ({
  error: state.submissions.get('initialDataError'),
  isImporting: state.submissions.get('loadingInitialData'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onImportClick(importValue: number) {
    dispatch(importExternalLiterature(importValue));
  },
});

export default connect(stateToProps, dispatchToProps)(DataImporter);
