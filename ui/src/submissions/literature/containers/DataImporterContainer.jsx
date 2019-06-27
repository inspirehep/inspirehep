import { connect } from 'react-redux';

import { importExternalLiterature } from '../../../actions/submissions';
import DataImporter from '../components/DataImporter';

const stateToProps = state => ({
  error: state.submissions.get('initialDataError'),
  isImporting: state.submissions.get('loadingInitialData'),
});

const dispatchToProps = dispatch => ({
  onImportClick(importValue) {
    dispatch(importExternalLiterature(importValue));
  },
});

export default connect(stateToProps, dispatchToProps)(DataImporter);
