import { connect } from 'react-redux';

import CitationSummaryBox from '../components/CitationSummaryBox';
import { fetchCitationSummary } from '../../actions/citations';
import { changeExcludeSelfCitations } from '../../actions/ui';

const stateToProps = (state, { namespace }) => ({
  query: state.search.getIn(['namespaces', namespace, 'query']),
  excludeSelfCitations: state.ui.get('excludeSelfCitations'),
});

const dispatchToProps = dispatch => ({
  onQueryChange(query, excludeSelfCitations) {
    if (excludeSelfCitations) {
      dispatch(
        fetchCitationSummary(query.set('exclude-self-citations', true).toJS())
      );
    } else {
      dispatch(fetchCitationSummary(query.toJS()));
    }
  },
  onExcludeSelfCitationsChange(checked) {
    dispatch(changeExcludeSelfCitations(checked));
  },
});

export default connect(stateToProps, dispatchToProps)(CitationSummaryBox);
