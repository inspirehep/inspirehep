import { connect } from 'react-redux';

import CitationSummarySwitch from '../components/CitationSummarySwitch';
import { setHash } from '../../actions/router';

export const WITH_CITATION_SUMMARY = '#with-citation-summary';

export function isCitationSummaryEnabled(state) {
  return state.router.location.hash === WITH_CITATION_SUMMARY;
}

const stateToProps = state => ({
  checked: isCitationSummaryEnabled(state)
});

const dispatchToProps = dispatch => ({
  onChange(isEnabled) {
    const hash = isEnabled ? WITH_CITATION_SUMMARY : ''
    dispatch(setHash(hash));
  },
});

export default connect(stateToProps, dispatchToProps)(CitationSummarySwitch);
