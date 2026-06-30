import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { RootState } from '../types';

import BibliographyGenerator from './BibliographyGenerator';
import { submitBibliographyGenerator } from '../actions/bibliographyGenerator';

const stateToProps = (state: RootState) => ({
  loading: state.bibliographyGenerator.get('loading'),
  data: state.bibliographyGenerator.get('data'),
  citationErrors: state.bibliographyGenerator.get('citationErrors'),
  error: state.bibliographyGenerator.get('error'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  async onSubmit(formData: { fileupload: { file: string }; format: string }) {
    const data = new FormData();
    data.append('file', formData.fileupload.file);
    await dispatch(submitBibliographyGenerator(formData.format, data));
  },
});
export default connect(stateToProps, dispatchToProps)(BibliographyGenerator);
