import { connect } from 'react-redux';

import { fetchCitationSummary } from '../../actions/citations';
import ExcludeSelfCitations from '../components/ExcludeSelfCitations';
import { EXCLUDE_SELF_CITATIONS_PREFERENCE } from '../../reducers/user';
import { appendQueryToLocationSearch } from '../../actions/router';
import { setPreference } from '../../actions/user';

export const UI_EXCLUDE_SELF_CITATIONS_PARAM = 'ui-exclude-self-citations';

function selfCitationsExcludedOnLocation(state) {
  return state.router.location.query[UI_EXCLUDE_SELF_CITATIONS_PARAM] != null;
}

function selfCitationsExcludedOnUserPreferences(state) {
  return state.user.getIn(
    ['preferences', EXCLUDE_SELF_CITATIONS_PREFERENCE],
    false
  );
}

export function shouldExcludeSelfCitations(state) {
  return (
    selfCitationsExcludedOnLocation(state) ||
    selfCitationsExcludedOnUserPreferences(state)
  );
}

const stateToProps = state => ({
  excluded: selfCitationsExcludedOnLocation(state),
  preference: selfCitationsExcludedOnUserPreferences(state),
});

const dispatchToProps = (dispatch, { namespace }) => ({
  onChange(excluded) {
    dispatch(setPreference(EXCLUDE_SELF_CITATIONS_PREFERENCE, excluded));
    if (!excluded) {
      dispatch(
        appendQueryToLocationSearch({
          [UI_EXCLUDE_SELF_CITATIONS_PARAM]: undefined,
        })
      );
    }
    dispatch(fetchCitationSummary(namespace));
  },
  onPreferenceChange(preference) {
    if (preference) {
      dispatch(
        appendQueryToLocationSearch({ [UI_EXCLUDE_SELF_CITATIONS_PARAM]: true })
      );
    }
  },
});

export default connect(stateToProps, dispatchToProps)(ExcludeSelfCitations);
