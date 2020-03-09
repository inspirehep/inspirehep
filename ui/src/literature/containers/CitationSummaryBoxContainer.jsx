import { connect } from 'react-redux';

import CitationSummaryBox from '../components/CitationSummaryBox';
import { fetchCitationSummary } from '../../actions/citations';

const stateToProps = (state, { namespace }) => ({
  query: state.search.getIn(['namespaces', namespace, 'query']),
});

const dispatchToProps = dispatch => ({
  onQueryChange(query) {
    dispatch(fetchCitationSummary(query.toJS()));
  },
});

export default connect(stateToProps, dispatchToProps)(CitationSummaryBox);
