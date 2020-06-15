import { connect } from 'react-redux';

import CitationSummarySwitch from '../components/CitationSummarySwitch';
import { setPreference } from '../../actions/user';
import { appendQueryToLocationSearch } from '../../actions/router';
import { CITATION_SUMMARY_ENABLING_PREFERENCE } from '../../reducers/user';
import { fetchCitationSummary } from '../../actions/citations';

export const UI_CITATION_SUMMARY_PARAM = 'ui-citation-summary';

function isCitationSummaryEnabledOnLocation(state) {
  return state.router.location.query[UI_CITATION_SUMMARY_PARAM] != null;
}

function isCitationSummaryEnabledOnUserPreferences(state) {
  return state.user.getIn(
    ['preferences', CITATION_SUMMARY_ENABLING_PREFERENCE],
    false
  );
}

export function isCitationSummaryEnabled(state) {
  return (
    isCitationSummaryEnabledOnLocation(state) ||
    isCitationSummaryEnabledOnUserPreferences(state)
  );
}

const stateToProps = state => ({
  checked: isCitationSummaryEnabledOnLocation(state),
  citationSummaryEnablingPreference: isCitationSummaryEnabledOnUserPreferences(
    state
  ),
});

const dispatchToProps = (dispatch, { namespace }) => ({
  onChange(isEnabled) {
    dispatch(setPreference(CITATION_SUMMARY_ENABLING_PREFERENCE, isEnabled));
    if (!isEnabled) {
      dispatch(
        appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: undefined })
      );
    } else {
      dispatch(fetchCitationSummary(namespace));
    }
  },
  onCitationSummaryUserPreferenceChange(citationSummaryPreference) {
    if (citationSummaryPreference) {
      dispatch(
        appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: true })
      );
    }
  },
});

export default connect(stateToProps, dispatchToProps)(CitationSummarySwitch);
