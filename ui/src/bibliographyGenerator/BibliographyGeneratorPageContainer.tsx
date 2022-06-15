import { connect } from 'react-redux';
import BibliographyGenerator from './BibliographyGenerator';
import { submitBibliographyGenerator } from '../actions/bibliographyGenerator';

const stateToProps = (state: any) => ({
  loading: state.bibliographyGenerator.get('loading'),
  data: state.bibliographyGenerator.get('data'),
  citationErrors: state.bibliographyGenerator.get('citationErrors'),
  error: state.bibliographyGenerator.get('error')
});

const dispatchToProps = (dispatch: any) => ({
  async onSubmit(formData: any) {
    const data = new FormData();
    data.append('file', formData.fileupload.file);
    await dispatch(submitBibliographyGenerator(formData.format, data));
  }
});
export default connect(stateToProps, dispatchToProps)(BibliographyGenerator);
