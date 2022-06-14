// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { importExternalLiterature } from '../../../actions/submissions';
import DataImporter from '../components/DataImporter';

const stateToProps = (state: any) => ({
  error: state.submissions.get('initialDataError'),
  isImporting: state.submissions.get('loadingInitialData')
});

const dispatchToProps = (dispatch: any) => ({
  onImportClick(importValue: any) {
    dispatch(importExternalLiterature(importValue));
  }
});

export default connect(stateToProps, dispatchToProps)(DataImporter);
