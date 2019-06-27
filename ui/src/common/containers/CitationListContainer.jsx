import { connect } from 'react-redux';

import { fetchCitations } from '../../actions/citations';
import CitationList from '../components/CitationList';

const stateToProps = state => ({
  loading: state.citations.get('loading'),
  citations: state.citations.get('data'),
  total: state.citations.get('total'),
  error: state.citations.get('error'),
});

const dispatchToProps = (dispatch, ownProps) => ({
  onPageDisplay({ page, pageSize }) {
    const { pidType, recordId } = ownProps;
    dispatch(fetchCitations(pidType, recordId, { page, pageSize }));
  },
});

export default connect(stateToProps, dispatchToProps)(CitationList);
