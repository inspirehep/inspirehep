import { connect } from 'react-redux';

import CitationSummarySwitch from '../components/CitationSummarySwitch';
import { setPreference } from '../../actions/user';
import { setHash } from '../../actions/router';
import { WITH_CITATION_SUMMARY } from '../constants';
import { CITATION_SUMMARY_ENABLING_PREFERENCE } from '../../reducers/user';
import { fetchCitationSummary } from '../../actions/citations';

export function isCitationSummaryEnabled(state) {
  return state.router.location.hash === WITH_CITATION_SUMMARY;
}

export function isCitationSummaryPreferenceSet(state) {
  return state.user.getIn([
    'preferences',
    CITATION_SUMMARY_ENABLING_PREFERENCE,
  ]);
}

const stateToProps = state => ({
  checked: isCitationSummaryEnabled(state),
  citationSummaryEnablingPreference: isCitationSummaryPreferenceSet(state),
});

const dispatchToProps = (dispatch, { namespace }) => ({
  onChange(isEnabled) {
    dispatch(setPreference(CITATION_SUMMARY_ENABLING_PREFERENCE, isEnabled));
    if (!isEnabled) {
      dispatch(setHash(''));
    } else {
      dispatch(fetchCitationSummary(namespace));
    }
  },
  onCitationSummaryUserPreferenceChange(citationSummaryPreference) {
    if (citationSummaryPreference) {
      dispatch(setHash(WITH_CITATION_SUMMARY));
    }
  },
});

export default connect(stateToProps, dispatchToProps)(CitationSummarySwitch);
