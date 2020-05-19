import { connect } from 'react-redux';

import CitationSummaryBox from '../components/CitationSummaryBox';
import { fetchCitationSummary } from '../../actions/citations';
import { changeExcludeSelfCitations } from '../../actions/ui';

const stateToProps = state => ({
  excludeSelfCitations: state.ui.get('excludeSelfCitations'),
});

const dispatchToProps = (dispatch, { namespace }) => ({
  onExcludeSelfCitationsChange(checked) {
    dispatch(changeExcludeSelfCitations(checked));
    dispatch(fetchCitationSummary(namespace));
  },
});

export default connect(stateToProps, dispatchToProps)(CitationSummaryBox);
