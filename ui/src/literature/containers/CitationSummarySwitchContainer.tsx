// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import CitationSummarySwitch from '../components/CitationSummarySwitch';
import { setPreference } from '../../actions/user';
import { appendQueryToLocationSearch } from '../../actions/router';
import { CITATION_SUMMARY_ENABLING_PREFERENCE } from '../../reducers/user';
import { fetchCitationSummary } from '../../actions/citations';

export const UI_CITATION_SUMMARY_PARAM = 'ui-citation-summary';

function isCitationSummaryEnabledOnLocation(state: $TSFixMe) {
  return state.router.location.query[UI_CITATION_SUMMARY_PARAM] != null;
}

function isCitationSummaryEnabledOnUserPreferences(state: $TSFixMe) {
  return state.user.getIn(
    ['preferences', CITATION_SUMMARY_ENABLING_PREFERENCE],
    false
  );
}

export function isCitationSummaryEnabled(state: $TSFixMe) {
  return (
    isCitationSummaryEnabledOnLocation(state) ||
    isCitationSummaryEnabledOnUserPreferences(state)
  );
}

const stateToProps = (state: $TSFixMe) => ({
  checked: isCitationSummaryEnabledOnLocation(state),

  citationSummaryEnablingPreference: isCitationSummaryEnabledOnUserPreferences(
    state
  )
});

const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    namespace
  }: $TSFixMe
) => ({
  onChange(isEnabled: $TSFixMe) {
    dispatch(setPreference(CITATION_SUMMARY_ENABLING_PREFERENCE, isEnabled));
    if (!isEnabled) {
      dispatch(
        appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: undefined })
      );
    } else {
      dispatch(fetchCitationSummary(namespace));
    }
  },

  onCitationSummaryUserPreferenceChange(citationSummaryPreference: $TSFixMe) {
    if (citationSummaryPreference) {
      dispatch(
        appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: true })
      );
    }
  }
});

export default connect(stateToProps, dispatchToProps)(CitationSummarySwitch);
