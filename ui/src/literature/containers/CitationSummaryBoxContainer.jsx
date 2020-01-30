import { connect } from 'react-redux';

import { LITERATURE_NS } from '../../reducers/search';
import CitationSummaryBox from '../components/CitationSummaryBox';
import { fetchCitationSummary } from '../../actions/citations';

const stateToProps = state => ({
  query: state.search.getIn(['namespaces', LITERATURE_NS, 'query']),
});

const dispatchToProps = dispatch => ({
  onQueryChange(query) {
    dispatch(fetchCitationSummary(query.toJS()));
  },
});

export default connect(stateToProps, dispatchToProps)(CitationSummaryBox);
