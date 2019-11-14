import { connect } from 'react-redux';

import { fetchCitations } from '../../actions/citations';
import CitationList from '../components/CitationList';
import { convertSomeImmutablePropsToJS } from '../immutableToJS';

const stateToProps = state => ({
  loading: state.citations.get('loading'),
  citations: state.citations.get('data'),
  total: state.citations.get('total'),
  error: state.citations.get('error'),
  query: state.citations.get('query'),
});

const dispatchToProps = (dispatch, ownProps) => ({
  onQueryChange(query) {
    const { recordId } = ownProps;
    dispatch(fetchCitations(recordId, query));
  },
});

export default connect(stateToProps, dispatchToProps)(
  convertSomeImmutablePropsToJS(CitationList, ['query'])
);
